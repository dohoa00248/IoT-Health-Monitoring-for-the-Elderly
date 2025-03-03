import mongoose from "mongoose";
import { configDotenv } from "dotenv";

configDotenv({ path: '../../.env' });

const connectDB = async () => {
    try {
        // const mongodbUri = 'mongodb://localhost:27017/test';
        // const mongodbUri = 'mongodb+srv://admin:bLw2SRf87epZSnfe@cluster0.7w5uepz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
        const mongodbUri = process.env.MONGODB_URI;
        await mongoose.connect(mongodbUri);
        console.log('Connected to MongoDB using Mongoose successfully.');
    } catch (error) {
        console.log('Connected to MongoDB using Mongoose failed.', error)
    }
}
// connectDB();
export default connectDB;