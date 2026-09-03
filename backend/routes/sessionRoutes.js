import express from "express";

import {
  createSession,
  getMySessions,
  getSessionById,
  updateSession,
  cancelSession,
  completeSession,
} from "../controllers/sessionController.js";

import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createSession);

router.get("/", authMiddleware, getMySessions);

router.get("/:id", authMiddleware, getSessionById);

router.put("/:id", authMiddleware, updateSession);

router.put("/:id/cancel", authMiddleware, cancelSession);

router.put("/:id/complete", authMiddleware, completeSession);

export default router;