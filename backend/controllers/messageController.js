
import Message from "../models/messageModel.js";
import SkillExchangeRequest from "../models/skillExchangeRequestModel.js";

// Check whether an accepted exchange exists
const checkChatAccess = async (userId, receiverId) => {
  const request = await SkillExchangeRequest.findOne({
    status: "accepted",
    $or: [
      { sender: userId, receiver: receiverId },
      { sender: receiverId, receiver: userId },
    ],
  });

  return request;
};

// Send message
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, message } = req.body;

    if (!receiverId || !message || !message.trim()) {
      return res.status(400).json({
        message: "Receiver and message are required",
      });
    }

    if (String(senderId) === String(receiverId)) {
      return res.status(400).json({
        message: "You cannot send a message to yourself",
      });
    }

    const acceptedRequest = await checkChatAccess(
      senderId,
      receiverId
    );

    if (!acceptedRequest) {
      return res.status(403).json({
        message: "Chat is available only for accepted exchange requests",
      });
    }

    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      message: message.trim(),
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "name profileImage")
      .populate("receiver", "name profileImage");

      // Send message to receiver through Socket.IO
     const io = req.app.get("io");
     io.to(String(receiverId)).emit("newMessage", populatedMessage);

    return res.status(201).json({
      message: "Message sent successfully",
      newMessage: populatedMessage,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to send message",
      error: error.message,
    });
  }
};

// Get chat history
export const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const receiverId = req.params.userId;

    const acceptedRequest = await checkChatAccess(
      userId,
      receiverId
    );

    if (!acceptedRequest) {
      return res.status(403).json({
        message: "You are not allowed to access this chat",
      });
    }

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: receiverId },
        { sender: receiverId, receiver: userId },
      ],
    })
      .populate("sender", "name profileImage")
      .populate("receiver", "name profileImage")
      .sort({ createdAt: 1 });

    return res.status(200).json({ messages });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};

// Mark received messages as read
export const markMessagesRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const senderId = req.params.userId;

    const acceptedRequest = await checkChatAccess(
      userId,
      senderId
    );

    if (!acceptedRequest) {
      return res.status(403).json({
        message: "You are not allowed to access this chat",
      });
    }

    await Message.updateMany(
      {
        sender: senderId,
        receiver: userId,
        isRead: false,
      },
      {
        $set: { isRead: true },
      }
    );

    return res.status(200).json({
      message: "Messages marked as read",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to mark messages as read",
      error: error.message,
    });
  }
};
