import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import configViewEngine from './config/view.engine.js';
import parseJson from './middleware/parseJsonMiddleware.js';
import setupMethodOverride from './middleware/methodOverrideMiddleware.js';
import webRoutes from './routes/web.js';
import connectDB from './config/db.connect.js';
import configStaticFolders from './config/static.folder.js';
import cookieParser from 'cookie-parser';
import corsMiddleware from './middleware/corsMiddleware.js';
import setupWebSocketServer from './config/websocket.js';

const app = express();
dotenv.config();

const server = http.createServer(app);
setupWebSocketServer(server);
connectDB();
configViewEngine(app);
configStaticFolders(app);
parseJson(app);
setupMethodOverride(app);
corsMiddleware(app);
app.use(cookieParser());
webRoutes(app);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
