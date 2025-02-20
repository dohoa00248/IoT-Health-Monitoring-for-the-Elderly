import { WebSocketServer } from 'ws';
import HealthData from '../models/HealthData.js';
import User from '../models/User.js';

// Biến để lưu trữ giá trị trước đó của nhịp tim và SpO2
let lastHeartRate = null;
let lastSpO2 = null;

// Các ngưỡng để chẩn đoán sức khỏe
const lowHeartRate = 60;
const highHeartRate = 80;
const lowSpo2 = 95;
const highTemp = 37.5;

// Hàm chẩn đoán sức khỏe
const diagnoseHealth = (heart_beat, spo2, temp_obj) => {
    let diagnosisArray = [];

    if (heart_beat < lowHeartRate) {
        diagnosisArray.push("Nhịp tim thấp");
    }
    if (heart_beat > highHeartRate) {
        diagnosisArray.push("Nhịp tim cao");
    }
    if (spo2 < lowSpo2) {
        diagnosisArray.push("SpO2 thấp");
    }
    if (temp_obj > highTemp) {
        diagnosisArray.push("Sốt");
    }
    if (diagnosisArray.length === 0) {
        diagnosisArray.push("Bình thường");
    }
    return diagnosisArray;
};

// Hàm chẩn đoán trạng thái sức khỏe
const diagnoseHealthStatus = (heart_beat, spo2, temp_obj) => {
    if (heart_beat < lowHeartRate || heart_beat > highHeartRate ||
        spo2 < lowSpo2 || temp_obj > highTemp) {
        return "Bất thường";
    }
    return "Khỏe mạnh";
};

// Tạo WebSocket server
const setupWebSocketServer = (server) => {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws, req) => {

        // Kiểm tra CORS (kiểm tra Origin header trong yêu cầu HTTP Upgrade)
        // const origin = req.headers.origin;
        // if (origin !== '*') {
        //     console.log(`Connection rejected from origin: ${origin}`);
        //     ws.close();  // Ngắt kết nối nếu origin không hợp lệ
        //     return;
        // }
        console.log('A user connected');  // Thông báo khi client kết nối

        // Gửi tin nhắn chào mừng đến client khi kết nối
        ws.send(JSON.stringify({ message: 'Welcome to the WebSocket server!' }));

        // Lắng nghe tin nhắn từ client
        ws.on('message', async (message) => {
            console.log('Received data from client:', message);

            // Kiểm tra nếu message là Buffer
            if (Buffer.isBuffer(message)) {
                // Chuyển buffer thành chuỗi JSON
                message = message.toString('utf-8');
            }

            try {
                const data = JSON.parse(message);

                console.log('Parsed data:', data);

                // Chẩn đoán sức khỏe và trạng thái sức khỏe
                const healthDiagnosis = diagnoseHealth(data.heartBeat, data.spo2, data.bodyTemp);
                const healthStatus = diagnoseHealthStatus(data.heartBeat, data.spo2, data.bodyTemp);

                // Thêm chẩn đoán vào dữ liệu
                data.healthDiagnosis = healthDiagnosis;
                data.healthStatus = healthStatus;

                // Kiểm tra nếu nhịp tim hoặc SpO2 thay đổi
                const heartRateChanged = data.heartBeat !== lastHeartRate;
                const spO2Changed = data.spo2 !== lastSpO2;

                if (heartRateChanged || spO2Changed) {
                    // Lưu dữ liệu vào MongoDB khi có thay đổi nhịp tim hoặc SpO2
                    const newHealthData = new HealthData({
                        deviceID: data.deviceID,
                        heartBeat: data.heartBeat,
                        spo2: data.spo2,
                        bodyTemp: data.bodyTemp,
                        ambientTemp: data.ambientTemp || 0,
                        healthDiagnosis: healthDiagnosis,
                        healthStatus: healthStatus
                    });
                    await newHealthData.save();

                    console.log('Data saved successfully:', newHealthData);

                    // Cập nhật giá trị nhịp tim và SpO2 trước đó
                    lastHeartRate = data.heartBeat;
                    lastSpO2 = data.spo2;

                    // Cập nhật mảng healthData trong User (bệnh nhân)
                    const patient = await User.findById(data.patientId);
                    if (patient) {
                        // Liên kết dữ liệu sức khỏe vào bệnh nhân
                        patient.healthData.push(newHealthData._id); // Thêm bản ghi sức khỏe vào mảng healthData
                        await patient.save();
                        console.log('Health data added to patient');
                    } else {
                        console.log('Patient not found with id:', data.patientId);
                    }
                } else {
                    console.log('No significant change in heart rate or SpO2, data not saved.');
                }

                // Gửi dữ liệu mới đến tất cả các client kết nối
                wss.clients.forEach((client) => {
                    if (client.readyState === client.OPEN) {
                        // Gửi dữ liệu dưới dạng JSON cho tất cả các client
                        client.send(JSON.stringify(data));
                    }
                });

            } catch (error) {
                console.error('Error processing message:', error);
                ws.send(JSON.stringify({ status: 'error', message: error.message }));
            }
        });

        // Lắng nghe khi client ngắt kết nối
        ws.on('close', () => {
            console.log('A user disconnected');
        });

        // Gửi thông báo khi kết nối bị lỗi
        ws.on('error', (error) => {
            console.error('WebSocket error: ', error);
            ws.send(JSON.stringify({ status: 'error', message: 'WebSocket connection error' }));
        });
    });

    console.log('WebSocket server running...');
};

export default setupWebSocketServer;
