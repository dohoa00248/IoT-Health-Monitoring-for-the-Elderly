// Biến để lưu trữ giá trị trước đó của nhịp tim và SpO2
let lastHeartRate = null;
let lastSpO2 = null;
// Các ngưỡng để chẩn đoán sức khỏe
const lowHeartRate = 60;
const highHeartRate = 80;
const lowSpo2 = 95;
const highTemp = 37.5;
const diagnoseHealth = (data) => {
  const { heartBeat, spo2, bodyTemp } = data;
  let diagnosisArray = [];

  if (heartBeat < lowHeartRate) {
    diagnosisArray.push("Nhịp tim thấp");
  }
  if (heartBeat > highHeartRate) {
    diagnosisArray.push("Nhịp tim cao");
  }
  if (spo2 < lowSpo2) {
    diagnosisArray.push("SpO2 thấp");
  }
  if (bodyTemp > highTemp) {
    diagnosisArray.push("Sốt");
  }
  if (diagnosisArray.length === 0) {
    diagnosisArray.push("Bình thường");
  }
  return diagnosisArray;
};

const diagnoseHealthStatus = (data) => {
  const { heartBeat, spo2, bodyTemp } = data;
  if (
    heartBeat < lowHeartRate ||
    heartBeat > highHeartRate ||
    spo2 < lowSpo2 ||
    bodyTemp > highTemp
  ) {
    return "Bất thường";
  }
  return "Khỏe mạnh";
};
export default {
  diagnoseHealth,
  diagnoseHealthStatus,
};
