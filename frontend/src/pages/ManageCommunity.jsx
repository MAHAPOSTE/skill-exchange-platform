import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import { useOutletContext } from "react-router-dom";

function ManageCommunity() {
  const { id } = useParams();
  const { user } = useOutletContext();

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

  const [resources, setResources] = useState([]);
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceFile, setResourceFile] = useState(null);
  const [resourceMessage, setResourceMessage] = useState(""); 

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
        const resourcesResponse = await api.get(
  `/api/communities/${id}/resources`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

setResources(resourcesResponse.data.resources);

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
  
  const handleUploadResource = async (e) => {
  e.preventDefault();

  setResourceMessage("");
  setError("");

  if (!resourceFile) {
    setResourceMessage("Please select a file");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    console.log("Token:", token);

    const formData = new FormData();

    formData.append("title", resourceTitle);
    formData.append("file", resourceFile);

    const response = await api.post(
      `/api/communities/${id}/resources`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setResources([response.data.resource, ...resources]);

    setResourceTitle("");
    setResourceFile(null);

    document.getElementById("resource-file").value = "";

    setResourceMessage(response.data.message);
  } catch (error) {
    setError(
      error.response?.data?.message ||
        "Failed to upload resource"
    );
  }
};

const handleDeleteResource = async (resourceId) => {
  setResourceMessage("");
  setError("");

  try {
    const token = localStorage.getItem("token");

    const response = await api.delete(
      `/api/communities/${id}/resources/${resourceId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setResources(
      resources.filter(
        (resource) => resource._id !== resourceId
      )
    );

    setResourceMessage(response.data.message);
  } catch (error) {
    setError(
      error.response?.data?.message ||
        "Failed to delete resource"
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
  <div className="min-h-screen bg-[#F3F6FA] px-4 py-8 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Page Header */}
      <div className="border-b border-[#DCE4EF] pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#142D4E] sm:text-4xl">
          Manage Community
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage your community, posts, members, and learning resources.
        </p>
      </div>

      {/* Edit Community */}
      <section className="rounded-2xl border border-[#DCE4EF] bg-white p-6 shadow-sm sm:p-8">
        <h2 className="mb-6 text-xl font-bold text-[#142D4E] sm:text-2xl">
          Edit Community
        </h2>

        <form onSubmit={handleUpdateCommunity} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#142D4E]">
              Community Name
            </label>
            <input
              type="text"
              value={communityName}
              onChange={(e) => setCommunityName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#DCE4EF] bg-white px-4 py-3 text-sm text-[#142D4E] outline-none transition focus:border-[#4F86F7] focus:ring-2 focus:ring-[#4F86F7]/20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#142D4E]">
              Community Description
            </label>
            <textarea
              value={communityDescription}
              onChange={(e) => setCommunityDescription(e.target.value)}
              rows={4}
              className="mt-2 w-full resize-y rounded-xl border border-[#DCE4EF] bg-white px-4 py-3 text-sm text-[#142D4E] outline-none transition focus:border-[#4F86F7] focus:ring-2 focus:ring-[#4F86F7]/20"
              required
            />
          </div>

          <button
         type="submit"
         className="inline-flex items-center justify-center rounded-xl bg-[#4F86F7] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3B73E6] focus:outline-none focus:ring-2 focus:ring-[#4F86F7] focus:ring-offset-2"
           >
        Update Community
          </button>
        </form>

        {updateMessage && (
          <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">
            {updateMessage}
          </p>
        )}
      </section>

      {/* Posts and Announcements */}
      <section className="rounded-2xl border border-[#DCE4EF] bg-white p-6 shadow-sm sm:p-8">
        <h2 className="mb-6 text-xl font-bold text-[#142D4E] sm:text-2xl">
          Posts & Announcements
        </h2>

        <form onSubmit={handleCreatePost} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#142D4E]">
              Title
            </label>
            <input
              type="text"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#DCE4EF] px-4 py-3 text-sm text-[#142D4E] outline-none transition focus:border-[#4F86F7] focus:ring-2 focus:ring-[#4F86F7]/20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#142D4E]">
              Content
            </label>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              rows={4}
              className="mt-2 w-full resize-y rounded-xl border border-[#DCE4EF] px-4 py-3 text-sm text-[#142D4E] outline-none transition focus:border-[#4F86F7] focus:ring-2 focus:ring-[#4F86F7]/20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#142D4E]">
              Type
            </label>
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#DCE4EF] bg-white px-4 py-3 text-sm text-[#142D4E] outline-none transition focus:border-[#4F86F7] focus:ring-2 focus:ring-[#4F86F7]/20"
            >
              <option value="post">Post</option>
              <option value="announcement">Announcement</option>
            </select>
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-[#142D4E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1D416D] focus:outline-none focus:ring-2 focus:ring-[#4F86F7] focus:ring-offset-2"
          >
            Create {postType === "post" ? "Post" : "Announcement"}
          </button>
        </form>

        {postMessage && (
          <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">
            {postMessage}
          </p>
        )}

        <div className="mt-8 border-t border-[#DCE4EF] pt-6">
          <h3 className="mb-5 text-lg font-bold text-[#142D4E]">
            Published Posts
          </h3>

          {posts.length === 0 ? (
            <p className="rounded-xl bg-[#F3F6FA] p-5 text-sm text-slate-500">
              No posts or announcements yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {posts.map((post) => (
                <article
                  key={post._id}
                  className="rounded-xl border border-[#DCE4EF] bg-[#F8FAFD] p-5 transition hover:shadow-md"
                >
                  {editingPostId === post._id ? (
                    <div className="space-y-4">
                      <h4 className="font-bold text-[#142D4E]">
                        Edit Post
                      </h4>

                      <input
                        type="text"
                        value={editPostTitle}
                        onChange={(e) => setEditPostTitle(e.target.value)}
                        className="w-full rounded-xl border border-[#DCE4EF] bg-white px-4 py-3 text-sm text-[#142D4E] outline-none focus:border-[#4F86F7] focus:ring-2 focus:ring-[#4F86F7]/20"
                        required
                      />

                      <textarea
                        value={editPostContent}
                        onChange={(e) => setEditPostContent(e.target.value)}
                        rows={4}
                        className="w-full rounded-xl border border-[#DCE4EF] bg-white px-4 py-3 text-sm text-[#142D4E] outline-none focus:border-[#4F86F7] focus:ring-2 focus:ring-[#4F86F7]/20"
                        required
                      />

                      <select
                        value={editPostType}
                        onChange={(e) => setEditPostType(e.target.value)}
                        className="w-full rounded-xl border border-[#DCE4EF] bg-white px-4 py-3 text-sm text-[#142D4E] outline-none focus:border-[#4F86F7] focus:ring-2 focus:ring-[#4F86F7]/20"
                      >
                        <option value="post">Post</option>
                        <option value="announcement">Announcement</option>
                      </select>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleUpdatePost(post._id)}
                          className="rounded-lg bg-[#142D4E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1D416D]"
                        >
                          Save Changes
                        </button>

                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="rounded-lg border border-[#DCE4EF] px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            post.type === "announcement"
                              ? "bg-blue-100 text-[#142D4E]"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {post.type === "announcement"
                            ? "Announcement"
                            : "Post"}
                        </span>

                        <span className="text-xs text-slate-500">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="break-words text-lg font-bold text-[#142D4E]">
                        {post.title}
                      </h3>

                      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                        {post.content}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-3 border-t border-[#DCE4EF] pt-4">
                        <button
                          type="button"
                          onClick={() => handleEditPost(post)}
                          className="rounded-lg border border-[#4F86F7] px-4 py-2 text-sm font-semibold text-[#142D4E] transition hover:bg-blue-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePost(post._id)}
                          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Community Members */}
      <section className="rounded-2xl border border-[#DCE4EF] bg-white p-6 shadow-sm sm:p-8">
        <h2 className="mb-6 text-xl font-bold text-[#142D4E] sm:text-2xl">
          Community Members
        </h2>

        {members.length === 0 ? (
          <p className="rounded-xl bg-[#F3F6FA] p-5 text-sm text-slate-500">
            No members found.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <div
                key={member._id}
                className="rounded-xl border border-[#DCE4EF] bg-[#F8FAFD] p-5 transition hover:shadow-md"
              >
                <h3 className="break-words font-bold text-[#142D4E]">
                  {member.name}
                </h3>

                <p className="mt-2 break-all text-sm text-slate-500">
                  {member.email}
                </p>

                <span className="mt-3 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold capitalize text-[#142D4E]">
                  {member.role}
                </span>

                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member._id)}
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    Remove Member
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Community Resources */}
      <section className="rounded-2xl border border-[#DCE4EF] bg-white p-6 shadow-sm sm:p-8">
        <h2 className="mb-6 text-xl font-bold text-[#142D4E] sm:text-2xl">
          Community Resources
        </h2>

        {(user?.role === "user" || user?.role === "mentor") && (
          <form
            onSubmit={handleUploadResource}
            className="space-y-5 rounded-xl border border-[#DCE4EF] bg-[#F8FAFD] p-5"
          >
            <h3 className="font-bold text-[#142D4E]">
              Upload a Learning Resource
            </h3>

            <div>
              <label className="block text-sm font-semibold text-[#142D4E]">
                Resource Title
              </label>
              <input
                type="text"
                value={resourceTitle}
                onChange={(e) => setResourceTitle(e.target.value)}
                placeholder="Enter resource title"
                className="mt-2 w-full rounded-xl border border-[#DCE4EF] bg-white px-4 py-3 text-sm text-[#142D4E] outline-none transition placeholder:text-slate-400 focus:border-[#4F86F7] focus:ring-2 focus:ring-[#4F86F7]/20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#142D4E]">
                File
              </label>
              <input
                id="resource-file"
                type="file"
                onChange={(e) => setResourceFile(e.target.files[0])}
                className="mt-2 block w-full cursor-pointer rounded-xl border border-[#DCE4EF] bg-white text-sm text-slate-600 file:mr-4 file:border-0 file:bg-[#142D4E] file:px-4 file:py-3 file:font-semibold file:text-white hover:file:bg-[#1D416D]"
                required
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-[#142D4E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1D416D] focus:outline-none focus:ring-2 focus:ring-[#4F86F7] focus:ring-offset-2"
            >
              Upload Resource
            </button>
          </form>
        )}

        {resourceMessage && (
          <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">
            {resourceMessage}
          </p>
        )}

        <div className="mt-8 border-t border-[#DCE4EF] pt-6">
          <h3 className="mb-5 text-lg font-bold text-[#142D4E]">
            Available Resources
          </h3>

          {resources.length === 0 ? (
            <p className="rounded-xl bg-[#F3F6FA] p-5 text-sm text-slate-500">
              No resources available.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {resources.map((resource) => {
                const isUploader =
                  resource.uploadedBy?._id === user?._id;

                const canDelete =
                  user?.role === "mentor" || isUploader;

                return (
                  <article
                    key={resource._id}
                    className="rounded-xl border border-[#DCE4EF] bg-[#F8FAFD] p-5 transition hover:shadow-md"
                  >
                    <h4 className="break-words font-bold text-[#142D4E]">
                      {resource.title}
                    </h4>

                    <p className="mt-3 text-sm text-slate-500">
                      Format: {resource.format || "Unknown"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Uploaded by: {resource.uploadedBy?.name || "Unknown"}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#DCE4EF] pt-4">
                      <a
                        href={resource.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-lg bg-[#142D4E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1D416D]"
                      >
                        View / Download
                      </a>

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDeleteResource(resource._id)}
                          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  </div>
);
}

export default ManageCommunity;