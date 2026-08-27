import MentorRequest from "../models/mentorRequestModel.js";
import User from "../models/userModel.js";

export const createMentorRequest = async (req, res) => {
  try {
    const existingRequest = await MentorRequest.findOne({
      user: req.user.id,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "Mentor request is already pending",
      });
    }

    if (req.user.role === "mentor") {
      return res.status(400).json({
        message: "You are already a mentor",
      });
    }

    const mentorRequest = await MentorRequest.create({
      user: req.user.id,
    });

    res.status(201).json({
      message: "Mentor request sent successfully",
      mentorRequest,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send mentor request",
      error: error.message,
    });
  }
};

export const getMentorRequests = async (req, res) => {
  try {
    const requests = await MentorRequest.find({
      status: "pending",
    }).populate("user", "name email role");

    res.status(200).json({
      count: requests.length,
      requests,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch mentor requests",
      error: error.message,
    });
  }
};

export const approveMentorRequest = async (req, res) => {
  try {
    const request = await MentorRequest.findById(
      req.params.id
    );

    if (!request) {
      return res.status(404).json({
        message: "Mentor request not found",
      });
    }

    request.status = "approved";

    await request.save();

    const user = await User.findById(request.user);

    user.role = "mentor";

    await user.save();

    res.status(200).json({
      message: "Mentor request approved successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to approve mentor request",
      error: error.message,
    });
  }
};

export const rejectMentorRequest = async (req, res) => {
  try {
    const request = await MentorRequest.findById(
      req.params.id
    );

    if (!request) {
      return res.status(404).json({
        message: "Mentor request not found",
      });
    }

    request.status = "rejected";

    await request.save();

    res.status(200).json({
      message: "Mentor request rejected",
      request,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reject mentor request",
      error: error.message,
    });
  }
};