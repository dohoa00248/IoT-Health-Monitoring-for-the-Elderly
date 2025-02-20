
import bcrypt from 'bcrypt'; // Đảm bảo bcrypt được import
import HealthData from "../models/HealthData.js";
import User from "../models/User.js";

// Tạo dữ liệu sức khỏe cho người dùng
const createHealthDataForUser = async (req, res) => {
    const { username, email, password, firstName, lastName, role, doctorId, deviceID, heartBeat, spo2, bodyTemp, ambientTemp, healthDiagnosis, healthStatus } = req.body;

    if (!username || !email || !password || !firstName || !lastName || role !== "3" || !doctorId) {
        return res.status(400).json({ message: 'Missing required fields or invalid role' });
    }

    try {
        console.log('Request body:', req.body);
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            console.log('User already exists');
            return res.status(400).json({ message: 'Username or Email already exists' });
        }

        const doctor = await User.findById(doctorId);
        if (!doctor || doctor.role !== 2) {
            console.log('Doctor not found or invalid doctor ID');
            return res.status(400).json({ message: 'Doctor not found or invalid doctor ID' });
        }
        // Tạo bản ghi healthData cho bệnh nhân
        const newHealthData = new HealthData({
            deviceID,
            heartBeat: heartBeat || 0,  // Nhịp tim mặc định
            spo2: spo2 || 0,            // SpO2 mặc định
            bodyTemp: bodyTemp || 0,    // Nhiệt độ mặc định
            ambientTemp: ambientTemp || 0, // Nhiệt độ môi trường mặc định
            healthDiagnosis: healthDiagnosis || [], // Chẩn đoán sức khỏe mặc định
            healthStatus: healthStatus || "Healthy", // Trạng thái sức khỏe mặc định
        });

        // Lưu bản ghi healthData vào DB
        await newHealthData.save();
        const newPatient = new User({
            username,
            email,
            password,
            firstName,
            lastName,
            role,
            doctorId,
            healthData: [newHealthData._id],
        });

        newPatient.password = await bcrypt.hash(newPatient.password, 10);

        await newPatient.save();

        doctor.patients.push(newPatient._id);
        await doctor.save();

        return res.status(201).json({ message: 'Patient created successfully', patient: newPatient });
    } catch (error) {
        console.error('Error creating patient:', error);
        return res.status(500).json({ message: 'Server error', error: error.message || error });
    }
};

// Lấy dữ liệu sức khỏe cho người dùng
const getHealthDataForUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId).populate('healthData');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.healthData.length === 0) {
            return res.status(404).json({ message: 'No health data found for this user' });
        }
        res.status(200).json(user.healthData);

    } catch (error) {
        console.error("Error retrieving health data:", error);
        res.status(500).json({ message: 'Error retrieving health data' });
    }
}

export default {
    createHealthDataForUser,
    getHealthDataForUser
}
