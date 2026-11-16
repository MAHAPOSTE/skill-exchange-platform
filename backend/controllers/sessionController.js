import mongoose from "mongoose";
import Session from "../models/sessionModel.js";
import SkillExchangeRequest from "../models/skillExchangeRequestModel.js";

const isSessionParticipant = (session, userId) => {
  const mentorId = session.mentor?._id || session.mentor;
  const learnerId = session.learner?._id || session.learner;

  return (
    String(mentorId) === String(userId) ||
    String(learnerId) === String(userId)
  );
};

const isAssignedMentor = (session, userId) => {
  const mentorId = session.mentor?._id || session.mentor;
  return String(mentorId) === String(userId);
};

const populateSession = (query) =>
  query
    .populate("mentor", "name email role")
    .populate("learner", "name email role")
    .populate("exchangeRequest");

const validateSessionDetails = (date, time, meetingLink) => {
  if (date !== undefined) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Please provide a valid session date";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    parsedDate.setHours(0, 0, 0, 0);

    if (parsedDate < today) {
      return "Session date cannot be in the past";
    }
  }

  if (time !== undefined && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    return "Please provide a valid session time";
  }

  if (meetingLink !== undefined && meetingLink.trim()) {
    try {
      const url = new URL(meetingLink);

      if (!["http:", "https:"].includes(url.protocol)) {
        return "Meeting link must use HTTP or HTTPS";
      }
    } catch {
      return "Please provide a valid meeting link";
    }
  }

  return null;
};

// Create Session
export const createSession = async (req, res) => {
  try {
    const { exchangeRequest, date, time, meetingLink = "" } = req.body;

    if (!["user", "mentor"].includes(req.user.role)) {
      return res.status(403).json({
        message: "Only users and mentors can schedule sessions",
      });
    }

    if (!exchangeRequest || !date || !time) {
      return res.status(400).json({
        message: "Exchange request, date and time are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(exchangeRequest)) {
      return res.status(400).json({
        message: "Invalid exchange request ID",
      });
    }

    const validationError = validateSessionDetails(
      date,
      time,
      meetingLink
    );

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const request = await SkillExchangeRequest.findById(exchangeRequest);

    if (!request) {
      return res.status(404).json({
        message: "Exchange request not found",
      });
    }

    if (request.status !== "accepted") {
      return res.status(400).json({
        message: "A session can only be created for an accepted exchange request",
      });
    }

    const isParticipant =
      String(request.sender) === String(req.user.id) ||
      String(request.receiver) === String(req.user.id);

    if (!isParticipant) {
      return res.status(403).json({
        message: "Only exchange participants can schedule a session",
      });
    }

    const existingSession = await Session.findOne({
      exchangeRequest,
      status: "scheduled",
    });

    if (existingSession) {
      return res.status(409).json({
        message: "A scheduled session already exists for this exchange",
      });
    }

    // Receiver is the mentor and sender is the learner in this workflow.
    const session = await Session.create({
      exchangeRequest,
      mentor: request.receiver,
      learner: request.sender,
      date,
      time,
      meetingLink: meetingLink.trim(),
    });

    const populatedSession = await populateSession(
      Session.findById(session._id)
    );

    return res.status(201).json({
      message: "Session scheduled successfully",
      session: populatedSession,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to schedule session",
      error: error.message,
    });
  }
};

// Get My Sessions
export const getMySessions = async (req, res) => {
  try {
    const filter =
      req.user.role === "admin"
        ? {}
        : {
            $or: [
              { mentor: req.user.id },
              { learner: req.user.id },
            ],
          };

    const sessions = await populateSession(
      Session.find(filter).sort({ date: 1, time: 1 })
    );

    return res.status(200).json({
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch sessions",
      error: error.message,
    });
  }
};

// Get Single Session
export const getSessionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid session ID",
      });
    }

    const session = await populateSession(Session.findById(id));

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      !isSessionParticipant(session, req.user.id)
    ) {
      return res.status(403).json({
        message: "You are not allowed to view this session",
      });
    }

    return res.status(200).json({
      message: "Session fetched successfully",
      session,
    });
  } catch (error) {
    return res.status(500).json({
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid session ID",
      });
    }

    const session = await Session.findById(id);

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    if (
      req.user.role !== "mentor" ||
      !isAssignedMentor(session, req.user.id)
    ) {
      return res.status(403).json({
        message: "Only the assigned mentor can update this session",
      });
    }

    if (session.status !== "scheduled") {
      return res.status(400).json({
        message: `A ${session.status} session cannot be updated`,
      });
    }

    if (
      date === undefined &&
      time === undefined &&
      meetingLink === undefined
    ) {
      return res.status(400).json({
        message: "Provide at least one field to update",
      });
    }

    const validationError = validateSessionDetails(
      date,
      time,
      meetingLink
    );

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    if (date !== undefined) session.date = date;
    if (time !== undefined) session.time = time;
    if (meetingLink !== undefined) {
      session.meetingLink = meetingLink.trim();
    }

    await session.save();

    const populatedSession = await populateSession(
      Session.findById(session._id)
    );

    return res.status(200).json({
      message: "Session updated successfully",
      session: populatedSession,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update session",
      error: error.message,
    });
  }
};

// Cancel Session
export const cancelSession = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid session ID",
      });
    }

    const session = await Session.findById(id);

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    if (
      req.user.role !== "mentor" ||
      !isAssignedMentor(session, req.user.id)
    ) {
      return res.status(403).json({
        message: "Only the assigned mentor can cancel this session",
      });
    }

    if (session.status !== "scheduled") {
      return res.status(400).json({
        message: `A ${session.status} session cannot be cancelled`,
      });
    }

    session.status = "cancelled";
    await session.save();

    const populatedSession = await populateSession(
      Session.findById(session._id)
    );

    return res.status(200).json({
      message: "Session cancelled successfully",
      session: populatedSession,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to cancel session",
      error: error.message,
    });
  }
};

// Complete Session
export const completeSession = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid session ID",
      });
    }

    const session = await Session.findById(id);

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    if (
      req.user.role !== "mentor" ||
      !isAssignedMentor(session, req.user.id)
    ) {
      return res.status(403).json({
        message: "Only the assigned mentor can complete this session",
      });
    }

    if (session.status !== "scheduled") {
      return res.status(400).json({
        message: `A ${session.status} session cannot be completed`,
      });
    }

    session.status = "completed";
    await session.save();

    const populatedSession = await populateSession(
      Session.findById(session._id)
    );

    return res.status(200).json({
      message: "Session marked as completed",
      session: populatedSession,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to complete session",
      error: error.message,
    });
  }
};