
import Notification from "../models/notificationModel.js";

// Get logged-in user's notifications
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({
      recipient: userId,
    })
      .populate("sender", "name profileImage")
      .sort({ createdAt: -1 });

    return res.status(200).json({ notifications });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

// Mark one notification as read
export const markNotificationRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        recipient: userId,
      },
      {
        isRead: true,
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update notification",
      error: error.message,
    });
  }
};

// Mark all notifications as read
export const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      {
        recipient: userId,
        isRead: false,
      },
      {
        isRead: true,
      }
    );

    return res.status(200).json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update notifications",
      error: error.message,
    });
  }
};
