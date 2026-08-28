import User from "../models/userModel.js";
import Skill from "../models/skillModel.js";

// Get logged-in user's own profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Profile fetched successfully",
      user: user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get profile",
      error: error.message,
    });
  }
};

// Update logged-in user's profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (name) {
      user.name = name;
    }

    if (email) {
      user.email = email;
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

// Search users by skill with pagination
export const getUsersBySkill = async (req, res) => {
  try {
    const { skill } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (skill) {
      filter.name = {
        $regex: skill,
        $options: "i",
      };
    }

    const totalSkills = await Skill.countDocuments(filter);

    const skills = await Skill.find(filter)
      .skip(skip)
      .limit(limit)
      .populate("user", "name email");

    const users = skills.map((skill) => ({
      skillId: skill._id,
      skill: skill.name,
      type: skill.type,
      user: skill.user,
    }));

    res.status(200).json({
      count: users.length,
      totalSkills: totalSkills,
      currentPage: page,
      totalPages: Math.ceil(totalSkills / limit),
      users: users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// View another user's profile
export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const skills = await Skill.find({
      user: id,
    }).select("name type");

    res.status(200).json({
      message: "User profile fetched successfully",
      user: user,
      skills: skills,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch user profile",
      error: error.message,
    });
  }
};