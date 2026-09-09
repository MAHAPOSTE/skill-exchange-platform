import express from "express";

import {
  getMyProfile,
  updateMyProfile,
  getUsersBySkill,
  getUserProfile,
  uploadProfilePicture,
} from "../controllers/userController.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import uploadProfileImage from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Get logged-in user's own profile
router.get("/profile", authMiddleware, getMyProfile);

// Update logged-in user's profile
router.put("/profile", authMiddleware, updateMyProfile);

// Search users by skill with pagination
router.get("/", getUsersBySkill);

// View another user's profile
router.get("/:id", authMiddleware, getUserProfile);

router.put(
  "/profile/image",
  authMiddleware,
  uploadProfileImage.single("image"),
  uploadProfilePicture
);

export default router;