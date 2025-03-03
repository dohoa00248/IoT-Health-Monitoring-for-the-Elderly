import User from "../models/User.js";
import bcrypt from 'bcrypt';

const getAllUsers = async (req, res) => {
    try {
        const users = await User.getAllUsers();
        res.render('userlist.ejs', { users: users });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
}

const getCreateUser = async (req, res) => {
    res.render('signup.ejs');
}

const createUser = async (req, res) => {

    try {
        const { username, password, email, role } = req.body;
        // const user = new User({ username: username, password: password, email: email, role: role });
        const user = await User.createUser(username, password, email, role);
        // await user.save();
        res.status(201).json({
            status: 'success',
            message: 'User created successfully.',
            data: user,
        });

    } catch (error) {
        res.status(400).json({
            status: false,
            message: 'Error creating user.',
            error: error
        });
    }
}

const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        const userById = await User.findById(userId);
        res.status(200).json(userById);
    } catch (error) {
        res.status(400).json({ status: false, message: 'Error finding user.', error: error });
    }
}

const getUpdatePage = async (req, res) => {

    try {
        const { userId } = req.params;
        const userById = await User.findById(userId);
        return res.render('update.ejs', { user: userById });
    } catch (error) {
        res.status(400).json({ status: false, message: 'Error finding user.', error: error });
    }
}

const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const updatedData = req.body;

        const updatedUser = await User.updateUser(userId, updatedData);

        if (!updatedUser) {
            return res.status(404).json({ status: 'Not Found', message: 'User not found.' });
        }

        return res.status(200).json({
            status: 'success',
            message: 'User updated successfully.',
        });
    } catch (error) {
        res.status(400).json({
            status: 'Bad Request',
            message: 'Error updating user.',
            error: error,
        });
    }
}

const getUpdatePasswordPage = async (req, res) => {
    try {
        const { userId } = req.params;
        const userById = await User.findById(userId);
        return res.render('updatepassword', { user: userById });
    } catch (error) {
        res.status(400).json({ status: false, message: 'Error finding user.', error: error });
    }
}

const updatePassword = async (req, res) => {
    try {
        const { userId } = req.params;
        const updatedData = req.body;

       
        const updatedUser = await User.updateUser(userId, updatedData);

        if (!updatedUser) {
            return res.status(404).json({ status: 'Not Found', message: 'User not found.' });
        }

       
        return res.status(200).json({
            status: 'success',
            message: 'Password updated successfully.',

        });
    } catch (error) {
        res.status(400).json({
            status: 'Bad Request',
            message: 'Error updating user.',
            error: error,
        });
    }
}

const getDeletePage = async (req, res) => {
    try {
        const { userId } = req.params;
        const userById = await User.findById(userId);
        return res.render('delete.ejs', { user: userById });
    } catch (error) {
        res.status(400).json({ status: false, message: 'Error finding user.', error: error });
    }
}

const deleteUser = async (req, res) => {

    try {
        const { userId } = req.params;

        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({
                status: 'Not Found',
                message: 'User not found.'
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'User deleted successfully.',
            user: user,
        });

    } catch (error) {
        res.status(400).json({
            status: 'Bad Request',
            message: 'Error deleting user.',
            error: error
        });
    }
}

const addPatient = async (req, res) => {
    const { username, email, password, firstName, lastName, role, doctorId, deviceId } = req.body;

    
    if (!username || !email || !password || !firstName || !lastName || parseInt(role) !== 3 || !doctorId || !deviceId) {
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

        const newPatient = new User({
            username,
            email,
            password,
            firstName,
            lastName,
            role,
            doctorId,
            deviceId,

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
}

const getUpdatePatientPage = async (req, res) => {
    try {
        const { userId } = req.params;
        const patientById = await User.findById(userId);
        const doctors = await User.getAllDoctors();
        console.log(doctors);

        if (!patientById) {
            return res.status(404).json({ status: false, message: 'Patient not found' });
        }

        return res.render('updatepatient.ejs', { user: patientById, doctors: doctors });
    } catch (error) {
        res.status(400).json({ status: false, message: 'Error finding user.', error: error });
    }
}
const getUpdateHealthDataPage = async (req, res) => {
    try {
        const { userId } = req.params;
        const patientById = await User.findById(userId);
        const doctors = await User.getAllDoctors();
        console.log(doctors);

        if (!patientById) {
            return res.status(404).json({ status: false, message: 'Patient not found' });
        }

        return res.render('updatehealthdata.ejs', { user: patientById, doctors: doctors });
    } catch (error) {
        res.status(400).json({ status: false, message: 'Error finding user.', error: error });
    }
}
export default {
    getCreateUser,
    createUser,
    getUserById,
    getUpdatePage,
    getDeletePage,
    updateUser,
    deleteUser,
    getAllUsers,
    addPatient,
    getUpdatePatientPage,
    updatePassword,
    getUpdatePasswordPage,
    getUpdateHealthDataPage
}