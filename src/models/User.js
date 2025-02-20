import mongoose from "mongoose";
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: Number,
        required: true,
        enum: [1, 2, 3], // 1: Admin, 2: Doctor, 3: Regular User
        // default: 3 
    },
    firstName: {
        type: String,
        // required: true
    },
    lastName: {
        type: String,
        // required: true
    },

    // Bac si quan ly benh nhan
    patients: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Bác sĩ quản lý bệnh nhân
        }
    ],

    // Bệnh nhân có thể có nhiều bản ghi sức khỏe
    healthData: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HealthData',
    }],
    //Benh nhan se lien ket vs thiet bi va ca bac si
    // deviceID: {
    //     type: String,
    //     required: false,

    //     unique: true 

    // },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
}, {
    timestamps: true,
    statics: {

        createUser: async function (username, password, email, role) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new this({
                username,
                password: hashedPassword,
                email,
                role
            });
            return await user.save();
        },

        signIn: async function (username, password) {
            const user = await this.findOne({ username });
            if (!user) {
                throw new Error('Username does not exist.');
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new Error('Password is incorrect.');
            }
            return user;
        },

        getUserById: async function (userId) {
            return await this.findById(userId);
        },

        getUserByEmail: async function (email) {
            return await this.findOne({ email: email });
        },

        updateUser: async function (userId, updatedUser) {
            if (updatedUser.password) {
                const hashedPassword = await bcrypt.hash(updatedUser.password, 10);
                updatedUser.password = hashedPassword;
            }
            const user = await this.findByIdAndUpdate(userId, updatedUser, { new: true });
            return user;
        },

        getAllUsers: async function () {
            return await this.find({});
        },

        getAllDoctors: async function () {
            return await this.find({ role: 2 });
        },
    }
});

const User = mongoose.model('User', userSchema);

export default User;
