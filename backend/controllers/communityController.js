import Community from "../models/communityModel.js";

// Create community - Mentor only
export const createCommunity = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        message: "Name and description are required",
      });
    }

    const community = await Community.create({
      name,
      description,
      mentor: req.user.id,
      members: [],
    });

    res.status(201).json({
      message: "Community created successfully",
      community,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create community",
      error: error.message,
    });
  }
};

// Get all communities
export const getCommunities = async (req, res) => {
  try {
    const communities = await Community.find()
      .populate("mentor", "name email role")
      .populate("members", "name email role");

    res.status(200).json({
      count: communities.length,
      communities,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch communities",
      error: error.message,
    });
  }
};

// Join community - Logged-in user
export const joinCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({
        message: "Community not found",
      });
    }

    const alreadyMember = community.members.includes(req.user.id);

    if (alreadyMember) {
      return res.status(400).json({
        message: "You are already a member of this community",
      });
    }

    community.members.push(req.user.id);

    await community.save();

    res.status(200).json({
      message: "Joined community successfully",
      community,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to join community",
      error: error.message,
    });
  }
};

// Get community members - Mentor only
export const getCommunityMembers = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate("members", "name email role")
      .populate("mentor", "name email role");

    if (!community) {
      return res.status(404).json({
        message: "Community not found",
      });
    }

    if (community.mentor._id.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only the community mentor can view members",
      });
    }

    res.status(200).json({
      count: community.members.length,
      members: community.members,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch community members",
      error: error.message,
    });
  }
};

// Remove member - Mentor only
export const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const community = await Community.findById(id);

    if (!community) {
      return res.status(404).json({
        message: "Community not found",
      });
    }

    // Check if logged-in mentor owns the community
    if (community.mentor.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only the community mentor can remove members",
      });
    }

    // Check if user is a member
    const isMember = community.members.some(
      (member) => member.toString() === userId
    );

    if (!isMember) {
      return res.status(404).json({
        message: "User is not a member of this community",
      });
    }

    // Remove member
    community.members = community.members.filter(
      (member) => member.toString() !== userId
    );

    await community.save();

    res.status(200).json({
      message: "Member removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to remove member",
      error: error.message,
    });
  }
};