import express from "express";

import {
  sendMessage,
  getMessages,
  markMessagesRead,
} from "../controllers/messageController.js";

import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/send", authMiddleware, sendMessage);

router.get("/:userId", authMiddleware, getMessages);

router.put("/:userId/read", authMiddleware, markMessagesRead);

export default router;
