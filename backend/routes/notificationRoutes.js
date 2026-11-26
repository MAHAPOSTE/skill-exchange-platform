
import express from "express";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/notificationController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getNotifications);
router.put("/read-all", authMiddleware, markAllNotificationsRead);
router.put("/:notificationId/read", authMiddleware, markNotificationRead);

export default router;
