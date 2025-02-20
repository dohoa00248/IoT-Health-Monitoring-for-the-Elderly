
const corsOptions = {
    origin: '*',  // Mặc định cho phép tất cả các nguồn gốc (phù hợp với môi trường phát triển)
    credentials: true, // Cho phép gửi cookie
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Các phương thức HTTP được phép
    allowedHeaders: ['Content-Type', 'Authorization'], // Các header được phép
};

export default corsOptions;