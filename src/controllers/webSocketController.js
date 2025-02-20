import healthService from '../services/healthService.js';

// Biến để lưu trữ giá trị trước đó của nhịp tim và SpO2
let lastHeartRate = null;
let lastSpO2 = null;

const setupWebSocketController = async (wss, ws, message) => {
    console.log('Received data from client:', message);

    // Kiểm tra nếu message là Buffer
    if (Buffer.isBuffer(message)) {
        message = message.toString('utf-8');
    }

    try {
        // Phân tích cú pháp chuỗi JSON nhận được
        const data = JSON.parse(message);
        console.log('Parsed data:', data);

        // Chẩn đoán sức khỏe và trạng thái sức khỏe
        const healthDiagnosis = healthService.diagnoseHealth(data.heartBeat, data.spo2, data.bodyTemp);
        const healthStatus = healthService.diagnoseHealthStatus(data.heartBeat, data.spo2, data.bodyTemp);

        // Thêm chẩn đoán vào dữ liệu
        data.healthDiagnosis = healthDiagnosis;
        data.healthStatus = healthStatus;

        // Kiểm tra nếu nhịp tim hoặc SpO2 thay đổi
        const heartRateChanged = data.heartBeat !== lastHeartRate;
        const spO2Changed = data.spo2 !== lastSpO2;

        if (heartRateChanged || spO2Changed) {
            // Lưu dữ liệu vào MongoDB khi có thay đổi nhịp tim hoặc SpO2
            const newHealthData = await healthService.saveHealthData(data, healthDiagnosis, healthStatus);
            console.log('Data saved successfully:', newHealthData);

            // Cập nhật giá trị nhịp tim và SpO2 trước đó
            lastHeartRate = data.heartBeat;
            lastSpO2 = data.spo2;

            // Cập nhật mảng healthData trong User (bệnh nhân)
            const isPatientUpdated = await healthService.updatePatientHealthData(data.patientId, newHealthData._id);
            if (isPatientUpdated) {
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
                client.send(JSON.stringify(data));
            }
        });

    } catch (error) {
        console.error('Error processing message:', error);
        ws.send(JSON.stringify({ status: 'error', message: error.message }));
    }
};

export default setupWebSocketController;
