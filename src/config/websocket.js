import { WebSocketServer } from "ws";
import HealthData from "../models/HealthData.js";
import User from "../models/User.js";
import diagnose from "../utils/diagnose.js";

// Biến để lưu trữ giá trị trước đó của nhịp tim và SpO2
let lastHeartRate = null;
let lastSpO2 = null;

const setupWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {
    console.log("A user connected");

    ws.send(JSON.stringify({ message: "Welcome to the WebSocket server!" }));

    ws.on("message", async (message) => {
      console.log("Received data from client:", message);

      // Kiểm tra nếu message là Buffer
      if (Buffer.isBuffer(message)) {
        message = message.toString("utf-8");
      }

      try {
        const data = JSON.parse(message);
        console.log("Parsed data:", data);

        const healthDiagnosis = diagnose.diagnoseHealth(data);
        const healthStatus = diagnose.diagnoseHealthStatus(data);

        data.healthDiagnosis = healthDiagnosis;
        data.healthStatus = healthStatus;
        console.log("Data after diagnose:", data);

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
        }

        wss.clients.forEach((client) => {
          if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(data));
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
};

export default setupWebSocketServer;
