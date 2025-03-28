import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
// import authenticateToken from '../middleware/testtoken.js';
import HealthData from "../models/HealthData.js";
import { configDotenv } from "dotenv";
// configDotenv({ path: '../../.env' });
// console.log(process.env.JWT_SECRET_KEY)
const router = express.Router();

// Route mặc định
router.get("/", async (req, res) => {
  res.render("index.ejs");
});

// Route mặc định
router.get("/websocket", async (req, res) => {
  res.render("websocket.ejs");
});

export default router;
