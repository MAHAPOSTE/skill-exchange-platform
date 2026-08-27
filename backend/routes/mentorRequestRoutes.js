import express from "express";

import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

import {
  createMentorRequest,
  getMentorRequests,
  approveMentorRequest,
  rejectMentorRequest,
} from "../controllers/mentorRequestController.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("user"),
  createMentorRequest
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  getMentorRequests
);

router.put(
  "/:id/approve",
  authMiddleware,
  roleMiddleware("admin"),
  approveMentorRequest
);

router.put(
  "/:id/reject",
  authMiddleware,
  roleMiddleware("admin"),
  rejectMentorRequest
);

export default router;