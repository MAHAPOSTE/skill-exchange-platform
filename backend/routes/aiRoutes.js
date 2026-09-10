import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { askAI } from "../controllers/aiController.js";

const router = express.Router();

router.post("/ask", authMiddleware, askAI);

export default router;