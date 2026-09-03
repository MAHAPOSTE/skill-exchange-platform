import express from "express";

import {
  getMyProfile,
  updateMyProfile,
  getUsersBySkill,
  getUserProfile,
} from "../controllers/userController.js";

import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get logged-in user's own profile
router.get("/profile", authMiddleware, getMyProfile);

// Update logged-in user's profile
router.put("/profile", authMiddleware, updateMyProfile);

// Search users by skill with pagination
router.get("/", getUsersBySkill);

// View another user's profile
router.get("/:id", authMiddleware, getUserProfile);

export default router;