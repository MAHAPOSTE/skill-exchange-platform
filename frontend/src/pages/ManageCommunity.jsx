import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

function ManageCommunity() {
  const { id } = useParams();

  const [members, setMembers] = useState([]);
  const [communityName, setCommunityName] = useState("");
  const [communityDescription, setCommunityDescription] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");

  const [posts, setPosts] = useState([]);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postType, setPostType] = useState("post");
  const [postMessage, setPostMessage] = useState("");

  const [editingPostId, setEditingPostId] = useState(null);
  const [editPostTitle, setEditPostTitle] = useState("");
  const [editPostContent, setEditPostContent] = useState("");
  const [editPostType, setEditPostType] = useState("post");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        const token = localStorage.getItem("token");

        const membersResponse = await api.get(
          `/api/communities/${id}/members`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setMembers(membersResponse.data.members);

        const communitiesResponse = await api.get(
          "/api/communities",
          {
            params: {
              page: 1,
              limit: 100,
            },
          }
        );

        const community =
          communitiesResponse.data.communities.find(
            (item) => item._id === id
          );

        if (community) {
          setCommunityName(community.name);
          setCommunityDescription(community.description);
        }

        const postsResponse = await api.get(
          `/api/communities/${id}/posts`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setPosts(postsResponse.data.posts);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to fetch community details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityData();
  }, [id]);

  const handleUpdateCommunity = async (e) => {
    e.preventDefault();

    setUpdateMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await api.put(
        `/api/communities/${id}`,
        {
          name: communityName,
          description: communityDescription,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUpdateMessage(response.data.message);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to update community"
      );
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();

    setPostMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await api.post(
        `/api/communities/${id}/posts`,
        {
          title: postTitle,
          content: postContent,
          type: postType,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPosts([response.data.post, ...posts]);

      setPostTitle("");
      setPostContent("");
      setPostType("post");

      setPostMessage(response.data.message);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create post"
      );
    }
  };

  const handleEditPost = (post) => {
    setEditingPostId(post._id);
    setEditPostTitle(post.title);
    setEditPostContent(post.content);
    setEditPostType(post.type);
    setPostMessage("");
    setError("");
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditPostTitle("");
    setEditPostContent("");
    setEditPostType("post");
  };

  const handleUpdatePost = async (postId) => {
    setPostMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await api.put(
        `/api/communities/${id}/posts/${postId}`,
        {
          title: editPostTitle,
          content: editPostContent,
          type: editPostType,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPosts(
        posts.map((post) =>
          post._id === postId
            ? response.data.post
            : post
        )
      );

      handleCancelEdit();
      setPostMessage(response.data.message);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to update post"
      );
    }
  };

  const handleDeletePost = async (postId) => {
    setPostMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await api.delete(
        `/api/communities/${id}/posts/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPosts(
        posts.filter((post) => post._id !== postId)
      );

      setPostMessage(response.data.message);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to delete post"
      );
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      const token = localStorage.getItem("token");

      await api.delete(
        `/api/communities/${id}/members/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMembers(
        members.filter((member) => member._id !== userId)
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to remove member"
      );
    }
  };

  if (loading) {
    return <p>Loading community...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="manage-community-page">
      <h1>Manage Community</h1>

      <div className="edit-community">
        <h2>Edit Community</h2>

        <form onSubmit={handleUpdateCommunity}>
          <div>
            <label>Community Name</label>

            <input
              type="text"
              value={communityName}
              onChange={(e) =>
                setCommunityName(e.target.value)
              }
              required
            />
          </div>

          <div>
            <label>Community Description</label>

            <textarea
              value={communityDescription}
              onChange={(e) =>
                setCommunityDescription(e.target.value)
              }
              required
            />
          </div>

          <button type="submit">
            Update Community
          </button>
        </form>

        {updateMessage && <p>{updateMessage}</p>}
      </div>

      <div className="community-posts">
        <h2>Posts & Announcements</h2>

        <form onSubmit={handleCreatePost}>
          <div>
            <label>Title</label>

            <input
              type="text"
              value={postTitle}
              onChange={(e) =>
                setPostTitle(e.target.value)
              }
              required
            />
          </div>

          <div>
            <label>Content</label>

            <textarea
              value={postContent}
              onChange={(e) =>
                setPostContent(e.target.value)
              }
              required
            />
          </div>

          <div>
            <label>Type</label>

            <select
              value={postType}
              onChange={(e) =>
                setPostType(e.target.value)
              }
            >
              <option value="post">Post</option>
              <option value="announcement">
                Announcement
              </option>
            </select>
          </div>

          <button type="submit">
            Create {postType === "post" ? "Post" : "Announcement"}
          </button>
        </form>

        {postMessage && <p>{postMessage}</p>}

        <div>
          <h3>Published Posts</h3>

          {posts.length === 0 ? (
            <p>No posts or announcements yet.</p>
          ) : (
            posts.map((post) => (
              <div key={post._id}>
                {editingPostId === post._id ? (
                  <div>
                    <h4>Edit Post</h4>

                    <input
                      type="text"
                      value={editPostTitle}
                      onChange={(e) =>
                        setEditPostTitle(e.target.value)
                      }
                      required
                    />

                    <textarea
                      value={editPostContent}
                      onChange={(e) =>
                        setEditPostContent(e.target.value)
                      }
                      required
                    />

                    <select
                      value={editPostType}
                      onChange={(e) =>
                        setEditPostType(e.target.value)
                      }
                    >
                      <option value="post">
                        Post
                      </option>

                      <option value="announcement">
                        Announcement
                      </option>
                    </select>

                    <button
                      type="button"
                      onClick={() =>
                        handleUpdatePost(post._id)
                      }
                    >
                      Save Changes
                    </button>

                    <button
                      type="button"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div>
                    <h3>{post.title}</h3>

                    <p>
                      Type:{" "}
                      {post.type === "announcement"
                        ? "Announcement"
                        : "Post"}
                    </p>

                    <p>{post.content}</p>

                    <p>
                      Created:{" "}
                      {new Date(
                        post.createdAt
                      ).toLocaleDateString()}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        handleEditPost(post)
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeletePost(post._id)
                      }
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="community-members">
        <h2>Community Members</h2>

        {members.length === 0 ? (
          <p>No members found.</p>
        ) : (
          members.map((member) => (
            <div key={member._id}>
              <p>Name: {member.name}</p>
              <p>Email: {member.email}</p>
              <p>Role: {member.role}</p>

              <button
                type="button"
                onClick={() =>
                  handleRemoveMember(member._id)
                }
              >
                Remove Member
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ManageCommunity;