import express from "express";

import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

import {
  createCommunity,
  getCommunities,
  joinCommunity,
  getCommunityMembers,
  removeMember,
} from "../controllers/communityController.js";

const router = express.Router();

// Mentor creates community
router.post(
  "/",
  authMiddleware,
  roleMiddleware("mentor"),
  createCommunity
);

// Anyone can view communities
router.get("/", getCommunities);

// Logged-in user joins community
router.post(
  "/:id/join",
  authMiddleware,
  joinCommunity
);

// Only community mentor can view members
router.get(
  "/:id/members",
  authMiddleware,
  roleMiddleware("mentor"),
  getCommunityMembers
);

// remove member from community (Mentor only)
router.delete(
  "/:id/members/:userId",
  authMiddleware,
  roleMiddleware("mentor"),
  removeMember
);

export default router;