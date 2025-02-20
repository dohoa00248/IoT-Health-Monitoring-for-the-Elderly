import mongoose from 'mongoose';
import User from './user.model.js'; // Điều chỉnh đường dẫn cho phù hợp

async function main() {
    try {
        await mongoose.connect('mongodb://localhost:27017/test', {

        });
        console.log('Connected to MongoDB!');

        // Gọi hàm findById và chờ kết quả
        const user = await User.createUser('test', 'test', 'test@gmail.com');
        console.log('User:', user); // In thông tin người dùng ra console
    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close(); // Đóng kết nối khi xong
    }
}

// Thực thi hàm chính
main();

