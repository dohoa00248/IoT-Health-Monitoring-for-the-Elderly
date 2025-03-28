import { configDotenv } from "dotenv";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

configDotenv();

function authenticateToken(req, res, next) {
  // Lấy token từ header Authorization
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    // Giải mã token và thêm thông tin người dùng vào request
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded; // Lưu thông tin người dùng trong req.user

    next(); // Tiếp tục xử lý request
  } catch (error) {
    return res.status(400).json({ message: "Invalid token." });
  }
}

export default authenticateToken;
