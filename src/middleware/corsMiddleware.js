
import cors from 'cors';
import corsOptions from '../config/cors.config.js'; // Import cấu hình CORS

const corsMiddleware = (app) => {
    // Áp dụng CORS middleware với cấu hình đã định nghĩa trong config
    app.use(cors(corsOptions));
};

export default corsMiddleware;