
import User from "../models/User.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

const signin = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Kiểm tra xem username và password có tồn tại trong request hay không
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required.' });
        }

        // Tìm người dùng trong cơ sở dữ liệu
        const user = await User.findOne({ username });
        if (!user) {
            // Nếu người dùng không tồn tại
            return res.status(400).json({ message: 'Username does not exist.' });
        }

        // Kiểm tra mật khẩu đã nhập có khớp với mật khẩu đã mã hóa trong cơ sở dữ liệu không
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // Nếu mật khẩu không khớp
            return res.status(400).json({ message: 'Password is incorrect.' });
        }

        // Tạo payload cho JWT (Token)
        const payload = {
            id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            doctorId: user.doctorId || null,  // Bác sĩ (nếu có)
            healthData: user.healthData || [], // Dữ liệu sức khỏe (nếu có)
            patients: user.patients || []      // Bệnh nhân (nếu có)
        };

        // Kiểm tra biến môi trường JWT_SECRET_KEY
        if (!process.env.JWT_SECRET_KEY) {
            return res.status(500).json({ message: 'Server error: Missing JWT secret key.' });
        }

        // Tạo token JWT với thời gian hết hạn là 1 giờ
        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

        // // Gửi token qua header Authorization (cách 1)
        // res.setHeader('Authorization', `Bearer ${token}`);

        // Gửi token qua cookie (cách 2 - nếu muốn dùng cookie)
        // res.cookie('token', token, {
        //     httpOnly: true,           // Cookie không thể truy cập qua JavaScript
        //     secure: process.env.NODE_ENV === 'production', // Chỉ gửi cookie qua HTTPS khi ở môi trường sản xuất
        //     sameSite: 'None',         // CORS yêu cầu sameSite=None nếu API ở domain khác
        //     maxAge: 3600000,          // Cookie sống trong 1 giờ (1h)
        //     path: '/',                // Cookie có thể truy cập ở mọi trang
        // });

        res.status(200).json({
            message: 'Login successful',
            token, // Trả về token nếu cần thiết
        });

    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export default {
    signin
}

