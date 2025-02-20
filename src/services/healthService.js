import HealthData from '../models/HealthData.js';
import User from '../models/User.js';

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

// Lưu dữ liệu sức khỏe vào cơ sở dữ liệu
const saveHealthData = async (data, healthDiagnosis, healthStatus) => {
    const newHealthData = new HealthData({
        deviceID: data.deviceID,
        heartBeat: data.heartBeat,
        spo2: data.spo2,
        bodyTemp: data.bodyTemp,
        ambientTemp: data.ambientTemp || 0,
        healthDiagnosis: healthDiagnosis,
        healthStatus: healthStatus
    });

    // Lưu vào cơ sở dữ liệu
    await newHealthData.save();
    return newHealthData;
};

// Cập nhật thông tin sức khỏe của bệnh nhân
const updatePatientHealthData = async (patientId, healthDataId) => {
    const patient = await User.findById(patientId);
    if (patient) {
        patient.healthData.push(healthDataId); // Thêm bản ghi sức khỏe vào mảng healthData
        await patient.save();
        return true;
    } else {
        return false;
    }
};

export default {
    diagnoseHealth,
    diagnoseHealthStatus,
    saveHealthData,
    updatePatientHealthData
};
