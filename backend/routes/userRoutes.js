import express from "express";

import {
  getMyProfile,
  updateMyProfile,
  getUsersBySkill,
  getUserProfile,
  uploadProfilePicture,
  getAllUsers,
} from "../controllers/userController.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import uploadProfileImage from "../middlewares/uploadMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Get logged-in user's own profile
router.get("/profile", authMiddleware, getMyProfile);

// Update logged-in user's profile
router.put("/profile", authMiddleware, updateMyProfile);

// Search users by skill with pagination
router.get("/", getUsersBySkill);

router.get(
  "/admin/all",
  authMiddleware,
  roleMiddleware("admin"),
  getAllUsers
);

// View another user's profile
router.get("/:id", authMiddleware, getUserProfile);

router.put(
  "/profile/image",
  authMiddleware,
  uploadProfileImage.single("image"),
  uploadProfilePicture
);

export default router;