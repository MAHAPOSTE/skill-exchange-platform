import User from "../models/userModel.js";
import Skill from "../models/skillModel.js";
import Community from "../models/communityModel.js";
import MentorRequest from "../models/mentorRequestModel.js";
import SkillExchangeRequest from "../models/skillExchangeRequestModel.js";
import Session from "../models/sessionModel.js";

export const getDashboardStats = async (req, res) => {
  try {
    const [
      users,
      mentors,
      skills,
      communities,
      exchangeRequests,
      sessions,
      pendingMentorRequests,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "mentor" }),
      Skill.countDocuments(),
      Community.countDocuments(),
      SkillExchangeRequest.countDocuments(),
      Session.countDocuments(),
      MentorRequest.countDocuments({ status: "pending" }),
    ]);

    res.status(200).json({
      users,
      mentors,
      skills,
      communities,
      exchangeRequests,
      sessions,
      pendingMentorRequests,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get dashboard statistics",
      error: error.message,
    });
  }
};