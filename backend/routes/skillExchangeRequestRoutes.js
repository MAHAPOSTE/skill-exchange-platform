import express from "express";

import {
  sendExchangeRequest,
  getSentRequests,
  getReceivedRequests,
  acceptExchangeRequest,
  rejectExchangeRequest,
} from "../controllers/skillExchangeRequestController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Send exchange request
router.post("/", authMiddleware, sendExchangeRequest);

// Get requests I sent
router.get("/sent", authMiddleware, getSentRequests);

// Get requests I received
router.get("/received", authMiddleware, getReceivedRequests);

// Accept request
router.put(
  "/:id/accept",
  authMiddleware,
  acceptExchangeRequest
);

// Reject request
router.put(
  "/:id/reject",
  authMiddleware,
  rejectExchangeRequest
);

export default router;