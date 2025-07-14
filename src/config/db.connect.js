import mongoose from 'mongoose';
import { configDotenv } from 'dotenv';

configDotenv({ path: '../../.env' });

const connectDB = async () => {
  try {
    const mongodbUri = process.env.MONGODB_URI;
    await mongoose.connect(mongodbUri);
    console.log('Connected to MongoDB using Mongoose successfully.');
  } catch (error) {
    console.log('Connected to MongoDB using Mongoose failed.', error);
  }
};
// connectDB();
export default connectDB;
