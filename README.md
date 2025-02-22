# Project Name

## Description

A brief description of what your project does and its purpose.

## Features

- List of key features and functionalities of the project.
  Application Function:
  Developed a real-time health monitoring application designed for elderly care, tracking vital signs such as heart rate, blood pressure, and glucose levels.
  Added user authentication (sign in) functionality to secure access and manage user sessions.
  Implemented an admin management panel for overseeing and managing application users and system settings.
  Features include real-time alerts for caregivers, historical data analysis, and integration with wearable devices to ensure continuous health oversight and timely intervention.

Technology Used:
Backend: Node.js and Express for server-side development.
Database: MongoDB Compass for cloud-based data storage, with Mongoose for schema management.
Frontend:
Bootstrap: Used for responsive design to ensure a consistent user experience across various devices and screen sizes.
jQuery: Employed for dynamic content manipulation and event handling to enhance interactivity and user experience.
EJS: Implemented for server-side templating, enabling dynamic rendering of HTML pages based on data from the server.
Authentication: Implemented user authentication using JSON Web Tokens (JWT) for secure sign-in and session management.
Admin Panel: Developed an admin management panel using Bootstrap for layout and styling, with jQuery for handling user interactions and dynamic content updates.

## Installation

Step-by-step instructions to set up the project locally. Include:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/yourproject.git
   ```
2. **Navigate to the project directory:**
   cd yourproject
3. **Install dependencies:**
   npm install
4. **Set Up Environment Variables: Create a .env file in the root directory based on the .env.example file provided. The .env file should contain the following variables:**

# Environment mode (development or production)

NODE_ENV=development

# Server configuration

PORT=8080
HOST_NAME=localhost

# Database configuration

MONGODB_URI=mongodb://localhost:27017/test

# For remote MongoDB Atlas, uncomment the following line and replace placeholders with actual credentials:

# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

5. **Run the Application: Start the application using:**

npm run dev

## Usage

Server is running on http://localhost:8080
Access the Application: Once the server is running, open your web browser and go to http://localhost:8080 to access the application.
Explore the Features: Use the application to explore its functionalities. This might include creating and managing records, viewing real-time data, or interacting with various features of the project.
Interacting with the API: If the project includes an API, you can use tools like Postman or cURL to test the API endpoints. Refer to the API documentation (if provided) for detailed information on the available endpoints and their usage.

Access the Admin Dashboard: For administrative functions, navigate to http://localhost:8080/api/v1/user/admin. This endpoint provides access to the admin dashboard where you can explore various administrative features.

## Configuration

test admin: username: admim , password: admin
test doctor: username: doctor, password: doctor
test user: username: patient, password: patient
