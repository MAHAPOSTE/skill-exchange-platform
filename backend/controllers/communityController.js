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
    const { search, sort } = req.query;

    const query = {};

    // Search by community name
    if (search) {
      query.name = {
        $regex: search,
        $options: "i",
      };
    }

    let sortOption = { createdAt: -1 };

    // Sorting
    if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    } else if (sort === "name_asc") {
      sortOption = { name: 1 };
    } else if (sort === "name_desc") {
      sortOption = { name: -1 };
    } else if (sort === "newest") {
      sortOption = { createdAt: -1 };
    }

    const communities = await Community.find(query)
      .populate("mentor", "name email role")
      .populate("members", "name email role")
      .sort(sortOption);

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

// Leave community - Logged-in user
export const leaveCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({
        message: "Community not found",
      });
    }

    // Community mentor cannot leave their own community
    if (community.mentor.toString() === req.user.id) {
      return res.status(400).json({
        message: "Community mentor cannot leave their own community",
      });
    }

    const isMember = community.members.some(
      (member) => member.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(400).json({
        message: "You are not a member of this community",
      });
    }

    community.members = community.members.filter(
      (member) => member.toString() !== req.user.id
    );

    await community.save();

    res.status(200).json({
      message: "Left community successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to leave community",
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

// Create Post / Announcement - Community Mentor only
export const createPost = async (req, res) => {
  try {
    const { title, content, type } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content are required",
      });
    }

    if (type && !["post", "announcement"].includes(type)) {
      return res.status(400).json({
        message: "Type must be either post or announcement",
      });
    }

    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({
        message: "Community not found",
      });
    }

    // Only community mentor can create posts
    if (community.mentor.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only the community mentor can create posts",
      });
    }

    community.posts.push({
      title,
      content,
      type: type || "post",
    });

    await community.save();

    const newPost = community.posts[community.posts.length - 1];

    res.status(201).json({
      message: "Post created successfully",
      post: newPost,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create post",
      error: error.message,
    });
  }
};

// Get Community Posts - Logged-in users
export const getCommunityPosts = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .select("name posts");

    if (!community) {
      return res.status(404).json({
        message: "Community not found",
      });
    }

    res.status(200).json({
      community: community.name,
      count: community.posts.length,
      posts: community.posts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch posts",
      error: error.message,
    });
  }
};

// Update Post / Announcement - Community Mentor only
export const updatePost = async (req, res) => {
  try {
    const { id, postId } = req.params;
    const { title, content, type } = req.body;

    const community = await Community.findById(id);

    if (!community) {
      return res.status(404).json({
        message: "Community not found",
      });
    }

    if (community.mentor.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only the community mentor can update posts",
      });
    }

    const post = community.posts.id(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (type && !["post", "announcement"].includes(type)) {
      return res.status(400).json({
        message: "Type must be either post or announcement",
      });
    }

    if (title !== undefined) {
      post.title = title;
    }

    if (content !== undefined) {
      post.content = content;
    }

    if (type !== undefined) {
      post.type = type;
    }

    post.updatedAt = new Date();

    await community.save();

    res.status(200).json({
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update post",
      error: error.message,
    });
  }
};

// Delete Post / Announcement - Community Mentor only
export const deletePost = async (req, res) => {
  try {
    const { id, postId } = req.params;

    const community = await Community.findById(id);

    if (!community) {
      return res.status(404).json({
        message: "Community not found",
      });
    }

    if (community.mentor.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only the community mentor can delete posts",
      });
    }

    const post = community.posts.id(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    post.deleteOne();

    await community.save();

    res.status(200).json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete post",
      error: error.message,
    });
  }
};