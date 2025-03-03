import mongoose from 'mongoose';
import User from './user.model.js'; 

async function main() {
    try {
        await mongoose.connect('mongodb://localhost:27017/test', {

        });
        console.log('Connected to MongoDB!');

        const user = await User.createUser('test', 'test', 'test@gmail.com');
        console.log('User:', user); 
    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close(); 
    }
}
main();

