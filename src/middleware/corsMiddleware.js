
import cors from 'cors';
import corsOptions from '../config/cors.config.js'; 

const corsMiddleware = (app) => {
    app.use(cors(corsOptions));
};

export default corsMiddleware;