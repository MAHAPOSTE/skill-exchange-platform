import express from "express";

import {
  getProfile,
  updateProfile,
  getUsersBySkill,
  getUserProfile,
} from "../controllers/userController.js";

import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get logged-in user's own profile
router.get("/profile", authMiddleware, getProfile);

// Update logged-in user's profile
router.put("/profile", authMiddleware, updateProfile);

// Search users by skill with pagination
router.get("/", getUsersBySkill);

// View another user's profile
router.get("/:id", authMiddleware, getUserProfile);

export default router;