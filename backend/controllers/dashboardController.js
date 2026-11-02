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
      User.aggregate([{ $count: "total" }]),

      User.aggregate([
        { $match: { role: "mentor" } },
        { $count: "total" },
      ]),

      Skill.aggregate([{ $count: "total" }]),

      Community.aggregate([{ $count: "total" }]),

      SkillExchangeRequest.aggregate([{ $count: "total" }]),

      Session.aggregate([{ $count: "total" }]),

      MentorRequest.aggregate([
        { $match: { status: "pending" } },
        { $count: "total" },
      ]),
    ]);

    const getCount = (result) => result[0]?.total || 0;

    res.status(200).json({
      users: getCount(users),
      mentors: getCount(mentors),
      skills: getCount(skills),
      communities: getCount(communities),
      exchangeRequests: getCount(exchangeRequests),
      sessions: getCount(sessions),
      pendingMentorRequests: getCount(pendingMentorRequests),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get dashboard statistics",
      error: error.message,
    });
  }
};