import { WebSocketServer } from "ws";
import HealthData from "../models/HealthData.js";
import User from "../models/User.js";

// Biến để lưu trữ giá trị trước đó của nhịp tim và SpO2
let lastHeartRate = null;
let lastSpO2 = null;

// Các ngưỡng để chẩn đoán sức khỏe
const lowHeartRate = 60;
const highHeartRate = 80;
const lowSpo2 = 95;
const highTemp = 37.5;

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

const diagnoseHealthStatus = (heart_beat, spo2, temp_obj) => {
  if (
    heart_beat < lowHeartRate ||
    heart_beat > highHeartRate ||
    spo2 < lowSpo2 ||
    temp_obj > highTemp
  ) {
    return "Bất thường";
  }
  return "Khỏe mạnh";
};

const setupWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {
    console.log("A user connected");

    ws.send(JSON.stringify({ message: "Welcome to the WebSocket server!" }));
    ws.on("message", async (message) => {
      console.log("Received data from client1:", message);

      // Kiểm tra nếu message là Buffer
      if (Buffer.isBuffer(message)) {
        message = message.toString("utf-8");
      }

      try {
        const data = JSON.parse(message);

        console.log("Parsed data:", data);

        const healthDiagnosis = diagnoseHealth(
          data.heartBeat,
          data.spo2,
          data.bodyTemp
        );
        const healthStatus = diagnoseHealthStatus(
          data.heartBeat,
          data.spo2,
          data.bodyTemp
        );

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
            healthStatus: healthStatus,
          });

          await newHealthData.save();

          console.log("Data saved successfully:", newHealthData);

          lastHeartRate = data.heartBeat;
          lastSpO2 = data.spo2;

          const patient = await User.findById(data.patientId);
          if (patient) {
            patient.healthData.push(newHealthData._id);
            await patient.save();
            console.log("Health data added to patient");
          } else {
            console.log("Patient not found with id:", data.patientId);
          }
        } else {
          console.log(
            "No significant change in heart rate or SpO2, data not saved."
          );
        }

        wss.clients.forEach((client) => {
          if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(data));
            console.log(data);
          }
        });
      } catch (error) {
        console.error("Error processing message:", error);
        ws.send(JSON.stringify({ status: "error", message: error.message }));
      }
    });

    ws.on("close", () => {
      console.log("A user disconnected");
    });

    ws.on("error", (error) => {
      console.error("WebSocket error: ", error);
      ws.send(
        JSON.stringify({
          status: "error",
          message: "WebSocket connection error",
        })
      );
    });
  });

  console.log("WebSocket server running...");
  // console.log("WebSocket server is running on ws://localhost:8080");
};

export default setupWebSocketServer;
