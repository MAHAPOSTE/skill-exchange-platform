import Session from "../models/sessionModel.js";
import SkillExchangeRequest from "../models/skillExchangeRequestModel.js";

// Create Session
export const createSession = async (req, res) => {
  try {
    const { exchangeRequest, date, time, meetingLink } = req.body;

    if (!exchangeRequest || !date || !time) {
      return res.status(400).json({
        message: "Exchange request, date and time are required",
      });
    }

    // Find exchange request
    const request = await SkillExchangeRequest.findById(exchangeRequest);

    if (!request) {
      return res.status(404).json({
        message: "Exchange request not found",
      });
    }

    // Session can be created only for accepted request
    if (request.status !== "accepted") {
      return res.status(400).json({
        message: "Session can only be created for an accepted exchange request",
      });
    }

    // Only sender or receiver can create the session
    const isParticipant =
      request.sender.toString() === req.user.id ||
      request.receiver.toString() === req.user.id;

    if (!isParticipant) {
      return res.status(403).json({
        message: "Only participants of the exchange can create a session",
      });
    }

    // Prevent duplicate active session
    const existingSession = await Session.findOne({
      exchangeRequest,
      status: "scheduled",
    });

    if (existingSession) {
      return res.status(400).json({
        message: "A session is already scheduled for this exchange",
      });
    }

    // In our exchange flow:
    // Receiver = person whose skill is requested
    // Sender = person requesting the skill
    const session = await Session.create({
      exchangeRequest,
      mentor: request.receiver,
      learner: request.sender,
      date,
      time,
      meetingLink: meetingLink || "",
    });

    res.status(201).json({
      message: "Session scheduled successfully",
      session,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to schedule session",
      error: error.message,
    });
  }
};

// Get My Sessions
export const getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [
        { mentor: req.user.id },
        { learner: req.user.id },
      ],
    })
      .populate("mentor", "name email role")
      .populate("learner", "name email role")
      .populate("exchangeRequest")
      .sort({ date: 1 });

    res.status(200).json({
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch sessions",
      error: error.message,
    });
  }
};

// Get Single Session
export const getSessionById = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await Session.findById(id)
      .populate("mentor", "name email role")
      .populate("learner", "name email role")
      .populate("exchangeRequest");

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    // Only participants can view the session
    const isParticipant =
      session.mentor._id.toString() === req.user.id ||
      session.learner._id.toString() === req.user.id;

    if (!isParticipant) {
      return res.status(403).json({
        message: "You are not allowed to view this session",
      });
    }

    res.status(200).json({
      message: "Session fetched successfully",
      session,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch session",
      error: error.message,
    });
  }
};

// Update Session
export const updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, meetingLink } = req.body;

    const session = await Session.findById(id);

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    // Only participants can update
    const isParticipant =
      session.mentor.toString() === req.user.id ||
      session.learner.toString() === req.user.id;

    if (!isParticipant) {
      return res.status(403).json({
        message: "Only session participants can update the session",
      });
    }

    // Do not update cancelled sessions
    if (session.status === "cancelled") {
      return res.status(400).json({
        message: "Cancelled session cannot be updated",
      });
    }

    if (date !== undefined) {
      session.date = date;
    }

    if (time !== undefined) {
      session.time = time;
    }

    if (meetingLink !== undefined) {
      session.meetingLink = meetingLink;
    }

    await session.save();

    res.status(200).json({
      message: "Session updated successfully",
      session,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update session",
      error: error.message,
    });
  }
};

// Cancel Session
export const cancelSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await Session.findById(id);

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    // Only participants can cancel
    const isParticipant =
      session.mentor.toString() === req.user.id ||
      session.learner.toString() === req.user.id;

    if (!isParticipant) {
      return res.status(403).json({
        message: "Only session participants can cancel the session",
      });
    }

    if (session.status !== "scheduled") {
      return res.status(400).json({
        message: `Session is already ${session.status}`,
      });
    }

    session.status = "cancelled";

    await session.save();

    res.status(200).json({
      message: "Session cancelled successfully",
      session,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to cancel session",
      error: error.message,
    });
  }
};

// Mark Session as Completed
export const completeSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await Session.findById(id);

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    // Only participants can complete
    const isParticipant =
      session.mentor.toString() === req.user.id ||
      session.learner.toString() === req.user.id;

    if (!isParticipant) {
      return res.status(403).json({
        message: "Only session participants can complete the session",
      });
    }

    if (session.status !== "scheduled") {
      return res.status(400).json({
        message: `Session is already ${session.status}`,
      });
    }

    session.status = "completed";

    await session.save();

    res.status(200).json({
      message: "Session marked as completed",
      session,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to complete session",
      error: error.message,
    });
  }
};