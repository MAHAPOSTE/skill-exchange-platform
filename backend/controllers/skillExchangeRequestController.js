import SkillExchangeRequest from "../models/skillExchangeRequestModel.js";
import Skill from "../models/skillModel.js";

// Send Skill Exchange Request
export const sendExchangeRequest = async (req, res) => {
  try {
    const senderId = req.user.id;

    const { receiver, offeredSkill, requestedSkill, message } = req.body;

    if (!receiver || !offeredSkill || !requestedSkill) {
      return res.status(400).json({
        message:
          "Receiver, offered skill and requested skill are required",
      });
    }

    // Sender cannot send request to themselves
    if (senderId === receiver) {
      return res.status(400).json({
        message: "You cannot send a request to yourself",
      });
    }

    // Check offered skill
    const senderSkill = await Skill.findOne({
      _id: offeredSkill,
      user: senderId,
    });

    if (!senderSkill) {
      return res.status(403).json({
        message: "You do not own the offered skill",
      });
    }

    // Check requested skill belongs to receiver
    const receiverSkill = await Skill.findOne({
      _id: requestedSkill,
      user: receiver,
    });

    if (!receiverSkill) {
      return res.status(400).json({
        message: "Requested skill does not belong to the receiver",
      });
    }

    // Check duplicate pending request
    const existingRequest = await SkillExchangeRequest.findOne({
      sender: senderId,
      receiver,
      offeredSkill,
      requestedSkill,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "Exchange request already exists",
      });
    }

    const request = await SkillExchangeRequest.create({
      sender: senderId,
      receiver,
      offeredSkill,
      requestedSkill,
      message,
    });

    res.status(201).json({
      message: "Skill exchange request sent successfully",
      request,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send exchange request",
      error: error.message,
    });
  }
};

// Get My Sent Requests
export const getSentRequests = async (req, res) => {
  try {
    const requests = await SkillExchangeRequest.find({
      sender: req.user.id,
    })
      .populate("receiver", "name email role")
      .populate("offeredSkill", "name type")
      .populate("requestedSkill", "name type")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: requests.length,
      requests,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch sent requests",
      error: error.message,
    });
  }
};

// Get My Received Requests
export const getReceivedRequests = async (req, res) => {
  try {
    const requests = await SkillExchangeRequest.find({
      receiver: req.user.id,
    })
      .populate("sender", "name email role")
      .populate("offeredSkill", "name type")
      .populate("requestedSkill", "name type")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: requests.length,
      requests,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch received requests",
      error: error.message,
    });
  }
};

// Accept Request
export const acceptExchangeRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await SkillExchangeRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        message: "Exchange request not found",
      });
    }

    // Only receiver can accept
    if (request.receiver.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only the receiver can accept this request",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: `Request is already ${request.status}`,
      });
    }

    request.status = "accepted";

    await request.save();

    res.status(200).json({
      message: "Exchange request accepted successfully",
      request,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to accept exchange request",
      error: error.message,
    });
  }
};

// Reject Request
export const rejectExchangeRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await SkillExchangeRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        message: "Exchange request not found",
      });
    }

    // Only receiver can reject
    if (request.receiver.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only the receiver can reject this request",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: `Request is already ${request.status}`,
      });
    }

    request.status = "rejected";

    await request.save();

    res.status(200).json({
      message: "Exchange request rejected successfully",
      request,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reject exchange request",
      error: error.message,
    });
  }
};