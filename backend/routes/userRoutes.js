import express from "express";
import {
  getProfile,
  updateProfile,
  getUsersBySkill,
} from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.get("/", getUsersBySkill);
export default router;