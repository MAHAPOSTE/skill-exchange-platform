import Skill from "../models/skillModel.js";

export const getLearners = async (req, res) => {
  try {
    const skills = await Skill.find({ type: "learn" }).populate(
      "user",
      "name email role"
    );

    const learners = skills.map((skill) => ({
      skill: skill.name,
      user: skill.user,
    }));

    res.status(200).json({
      success: true,
      count: learners.length,
      learners: learners,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch learners",
      error: error.message,
    });
  }
};