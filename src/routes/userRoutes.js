import express from 'express';
import User from '../models/User.js';
import mongoose from 'mongoose';
import userController from '../controllers/userController.js';
import HealthData from '../models/HealthData.js';

import authenticateToken from '../middleware/authMiddleware.js';


const router = express.Router();

// Sử dụng middleware xác thực token cho các route bảo mật
router.get('/', (req, res) => {
    try {
        res.render('user.ejs');
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});



router.get('/admin/dashboard', async (req, res) => {
    try {
        // Tìm tất cả người dùng trong cơ sở dữ liệu
        const users = await User.getAllUsers();

        // Render trang với dữ liệu người dùng
        res.render('admin.ejs', { users: users });
    } catch (error) {
        // Xử lý lỗi nếu có
        res.status(500).json({ message: 'Error fetching users', error });
    }
})

router.get('/doctor/dashboard', async (req, res) => {
    try {
        // Lấy thông tin bác sĩ từ token đã giải mã
        const doctor = req.user; // Thay vì 'user', dùng 'doctor' để rõ ràng hơn
        const latestHealthData = await HealthData.findOne().sort({ createdAt: -1 });
        res.render('doctor.ejs', { doctor: doctor, healthData: latestHealthData });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// router.get('/doctor/dashboard/:doctorId', authenticateToken, async (req, res) => {
//     try {
//         const { doctorId } = req.params; // Get doctorId from URL params

//         // Log doctorId to check if it's being passed correctly
//         console.log("Doctor ID:", doctorId);

//         // Find the doctor and populate their patients
//         const doctor = await User.findById(doctorId).populate('patients', 'firstName lastName email');

//         // Log the doctor data to check if it's correct
//         console.log("Doctor Data:", doctor);

//         if (!doctor || doctor.role !== 2) {  // Check if doctor exists and if role is 2
//             return res.status(400).json({ message: 'Bác sĩ không tồn tại hoặc không đúng' });
//         }
//         // Render trang dashboard của bác sĩ
//         res.render('doctor1', {
//             doctor: doctor,
//             patients: doctor.patients
//         });
//         // // Return the patients associated with the doctor
//         // res.status(200).json({
//         //     patients: doctor.patients
//         // });

//     } catch (error) {
//         console.error(error); // Log the error for more insights
//         res.status(500).json({ message: 'Lỗi server' });
//     }
// });
// router.get('/admin1', authenticateToken, (req, res) => {
//     res.render('admin1.ejs')
// })
router.get('/test', authenticateToken, (req, res) => {
    res.render('test.ejs');
})
// router.get('/doctor/dashboard',authenticateToken, async (req, res) => {
//     try {
//         // Lấy doctorId từ payload của token (đã được giải mã trong middleware)
//         const { doctorId } = req.user;  // `req.user` chứa thông tin từ payload

//         // Kiểm tra nếu doctorId không có trong token
//         if (!doctorId) {
//             return res.status(400).json({ message: 'Doctor ID không hợp lệ' });
//         }

//         // Lấy thông tin bác sĩ từ cơ sở dữ liệu
//         const doctor = await User.findById(doctorId).populate('patients', 'firstName lastName email');

//         // Kiểm tra xem có đúng là bác sĩ không
//         if (!doctor || doctor.role !== 2) {
//             return res.status(400).json({ message: 'Bác sĩ không tồn tại hoặc không đúng' });
//         }

//         // Render trang dashboard của bác sĩ
//         res.render('doctor1', {
//             doctor: doctor,
//             patients: doctor.patients
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Lỗi server' });
//     }
// });


router.get('/addpatient', (req, res) => {
    res.render('addpatient');
});

router.get('/addpatient-doctor', (req, res) => {
    res.render('addpatientfordoctor');
});

router.get('/patients/search', async (req, res) => {
    try {
        const searchQuery = req.query.query;
        console.log("Searching for:", searchQuery);  // Log để kiểm tra dữ liệu đầu vào

        // Tìm bệnh nhân theo tên (firstName hoặc lastName)
        const patients = await User.find({
            $or: [
                { firstName: { $regex: searchQuery, $options: 'i' } },
                { lastName: { $regex: searchQuery, $options: 'i' } }
            ]
        });

        if (patients.length === 0) {
            return res.json({ patients: [] });  // Nếu không có bệnh nhân
        }

        // Trả về toàn bộ thông tin của bệnh nhân tìm thấy
        res.json({ patients });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi tìm kiếm bệnh nhân');
    }
});
router.post('/addpatient', userController.addPatient);
router.get('/doctors', async (req, res) => {
    try {
        const doctors = await User.getAllDoctors();
        res.json(doctors);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ error: 'Failed to fetch doctors' });
    }
})
// // Lấy danh sách bệnh nhân của bác sĩ
// router.get('/patients', async (req, res) => {
//     try {
//         // Bạn có thể thay thế với ID bác sĩ bạn muốn, ví dụ:
//         const doctorId = '675ac0680f210f6e8847f775';  // Thay thế bằng ID của bác sĩ

//         // Lấy thông tin bác sĩ từ database, với thông tin bệnh nhân liên kết
//         const doctor = await User.findById(doctorId).populate('patients', 'firstName lastName email');

//         if (!doctor || doctor.role !== 2) {  // Kiểm tra xem có phải là bác sĩ không
//             return res.status(400).json({ message: 'Bác sĩ không tồn tại hoặc không đúng' });
//         }

//         // Trả về danh sách bệnh nhân của bác sĩ
//         res.status(200).json({
//             patients: doctor.patients  // Dữ liệu bệnh nhân sẽ được chứa trong doctor.patients
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Lỗi server' });
//     }

// });
router.get('/patients/:doctorId', async (req, res) => {
    try {
        const { doctorId } = req.params;  // Lấy doctorId từ URL parameter

        // Lấy thông tin bác sĩ từ database, với thông tin bệnh nhân liên kết
        const doctor = await User.findById(doctorId).populate('patients', 'firstName lastName email');

        if (!doctor || doctor.role !== 2) {  // Kiểm tra xem có phải là bác sĩ không
            return res.status(400).json({ message: 'Bác sĩ không tồn tại hoặc không đúng' });
        }

        // Trả về danh sách bệnh nhân của bác sĩ
        res.status(200).json({
            patients: doctor.patients  // Dữ liệu bệnh nhân sẽ được chứa trong doctor.patients
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});
router.get('/signup', userController.getCreateUser);

router.post('/signup', userController.createUser);

router.get('/users/:userId', userController.getUserById);

router.get('/update/:userId', userController.getUpdatePage);
router.put('/update/:userId', userController.updateUser);

router.get('/patient/:userId', userController.getUserById);
router.get('/update-patient/:userId', userController.getUpdatePatientPage);

router.get('/update-password/:userId', userController.getUpdatePasswordPage);
router.put('/update-password/:userId', userController.updatePassword);

router.get('/delete/:userId', userController.getDeletePage);
router.delete('/delete/:userId', userController.deleteUser);


router.get('/users', userController.getAllUsers)

export default router;