import express from "express";

import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

import {
  createCommunity,
  getCommunities,
  joinCommunity,
  leaveCommunity,
  getCommunityMembers,
  removeMember,
  createPost,
  getCommunityPosts,
  updatePost,
  deletePost,
  uploadCommunityResource,
  getCommunityResources,
  deleteCommunityResource,
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

router.delete(
  "/:id/leave",
  authMiddleware,
  leaveCommunity
);

// Create post / announcement - Mentor only
router.post(
  "/:id/posts",
  authMiddleware,
  roleMiddleware("mentor"),
  createPost
);

// Get community posts
router.get(
  "/:id/posts",
  authMiddleware,
  getCommunityPosts
);

// Update post / announcement - Mentor only
router.put(
  "/:id/posts/:postId",
  authMiddleware,
  roleMiddleware("mentor"),
  updatePost
);

// Delete post / announcement - Mentor only
router.delete(
  "/:id/posts/:postId",
  authMiddleware,
  roleMiddleware("mentor"),
  deletePost
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

router.post(
  "/:id/resources",
  authMiddleware,
  upload.single("file"),
  uploadCommunityResource
);

router.get(
  "/:id/resources",
  authMiddleware,
  getCommunityResources
);

router.delete(
  "/:id/resources/:resourceId",
  authMiddleware,
  deleteCommunityResource
);
export default router;