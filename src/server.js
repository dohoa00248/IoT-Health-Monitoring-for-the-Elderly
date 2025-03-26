import express from "express";
import dotenv from "dotenv";
import http from "http";
import { WebSocketServer } from "ws";
import configViewEngine from "./config/view.engine.js";
import parseJson from "./middleware/parseJsonMiddleware.js";
import setupMethodOverride from "./middleware/methodOverrideMiddleware.js";
import webRoutes from "./routes/web.js";
import connectDB from "./config/db.connect.js";
import configStaticFolders from "./config/static.folder.js";
import getLocalIP from "./config/local.config.js";
import cookieParser from "cookie-parser";
import corsMiddleware from "./middleware/corsMiddleware.js";

import HealthData from "./models/HealthData.js";
import setupWebSocketServer from "./config/websocket.js";
// import https from 'https';
// import fs from 'fs';

// Khởi tạo app Express
const app = express();

// Load các biến môi trường từ tệp .env
dotenv.config();

// Tạo HTTP server
const server = http.createServer(app);

setupWebSocketServer(server);

// Kết nối cơ sở dữ liệu MongoDB
connectDB();

// Cấu hình view engine
configViewEngine(app);

// Cấu hình thư mục static
configStaticFolders(app);

// Cấu hình middleware
parseJson(app);
setupMethodOverride(app);

// CORS middleware
corsMiddleware(app);

// Cấu hình cookie-parser middleware
app.use(cookieParser());

// Định nghĩa các routes
webRoutes(app);

// Cấu hình và chạy server
const PORT = process.env.PORT || 3000;
const HOSTNAME = process.env.HOST_NAME || "localhost" || getLocalIP();

// Bắt đầu server và lắng nghe kết nối
server.listen(PORT, HOSTNAME, () => {
  console.log(`Server is running on port ${PORT}`);
});
