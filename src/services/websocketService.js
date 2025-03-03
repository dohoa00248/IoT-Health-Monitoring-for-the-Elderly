import { WebSocketServer } from 'ws';
import HealthData from '../models/HealthData.js';
import User from '../models/User.js';

// Biến để lưu trữ giá trị trước đó của nhịp tim và SpO2
let lastHeartRate = null;
let lastSpO2 = null;

// Tạo WebSocket server
const setupWebSocketServer = (server) => {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws, req) => {

        // Kiểm tra CORS (kiểm tra Origin header trong yêu cầu HTTP Upgrade)
        const origin = req.headers.origin;
        if (origin !== '*') {
            console.log(`Connection rejected from origin: ${origin}`);
            ws.close();  // Ngắt kết nối nếu origin không hợp lệ
            return;
        }
        console.log('A user connected');  

        
        ws.send(JSON.stringify({ message: 'Welcome to the WebSocket server!' }));

       
        ws.on('message', async (message) => {
            console.log('Received data from client:', message);

            // Kiểm tra nếu message là Buffer
            if (Buffer.isBuffer(message)) {
                
                message = message.toString('utf-8');
            }

            try {
               
                const data = JSON.parse(message);

                console.log('Parsed data:', data);
               
                const healthDiagnosis = diagnoseHealth(data.heartBeat, data.spo2, data.bodyTemp);
                const healthStatus = diagnoseHealthStatus(data.heartBeat, data.spo2, data.bodyTemp);

              
                data.healthDiagnosis = healthDiagnosis;
                data.healthStatus = healthStatus;

                const heartRateChanged = data.heartBeat !== lastHeartRate;
                const spO2Changed = data.spo2 !== lastSpO2;

                if (heartRateChanged || spO2Changed) {
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

               
                wss.clients.forEach((client) => {
                    if (client.readyState === client.OPEN) {
                        client.send(JSON.stringify(data));
                    }
                });

            } catch (error) {
                console.error('Error processing message:', error);
                ws.send(JSON.stringify({ status: 'error', message: error.message }));
            }
        });

       
        ws.on('close', () => {
            console.log('A user disconnected');
        });

        ws.on('error', (error) => {
            console.error('WebSocket error: ', error);
            ws.send(JSON.stringify({ status: 'error', message: 'WebSocket connection error' }));
        });
    });

    console.log('WebSocket server running...');
};

export default setupWebSocketServer;
