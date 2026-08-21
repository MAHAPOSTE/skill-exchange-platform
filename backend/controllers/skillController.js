import Skill from "../models/skillModel.js";

export const addSkill = async (req, res) => {
  try {
    const { name, type } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        message: "Skill name and type are required",
      });
    }

    const skill = await Skill.create({
      name: name,
      type: type,
      user: req.user.id,
    });

    res.status(201).json({
      message: "Skill added successfully",
      skill: skill,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add skill",
      error: error.message,
    });
  }
};

export const getSkills = async (req, res) => {
  try {
    const skills = await Skill.find({
      user: req.user.id,
    });

    res.status(200).json({
      skills: skills,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get skills",
      error: error.message,
    });
  }
};

export const updateSkill = async (req, res) => {
  try {
    const { name, type } = req.body;

    const skill = await Skill.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!skill) {
      return res.status(404).json({
        message: "Skill not found",
      });
    }

    if (name) {
      skill.name = name;
    }

    if (type) {
      skill.type = type;
    }

    await skill.save();

    res.status(200).json({
      message: "Skill updated successfully",
      skill: skill,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update skill",
      error: error.message,
    });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!skill) {
      return res.status(404).json({
        message: "Skill not found",
      });
    }

    res.status(200).json({
      message: "Skill deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete skill",
      error: error.message,
    });
  }
};