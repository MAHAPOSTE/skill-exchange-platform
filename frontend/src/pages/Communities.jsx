import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
  fetchCommunities,
  joinCommunity,
  leaveCommunity,
  createCommunity,
} from "../store/communitiesSlice";
import api from "../api";

function Communities() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useOutletContext();

  const {
    communities,
    totalCommunities,
    totalPages,
    loading,
    error,
  } = useSelector((state) => state.communities);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [communityName, setCommunityName] = useState("");
  const [communityDescription, setCommunityDescription] = useState("");
  const [createError, setCreateError] = useState("");

  const [selectedCommunity, setSelectedCommunity] = useState(null);

  const [resources, setResources] = useState([]);
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceFile, setResourceFile] = useState(null);
  const [resourceLoading, setResourceLoading] = useState(false);
  const [resourceMessage, setResourceMessage] = useState("");
  const [resourceError, setResourceError] = useState("");

  useEffect(() => {
    dispatch(
      fetchCommunities({
        search,
        sort,
        page,
        limit,
      })
    );
  }, [dispatch, search, sort, page, limit]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleSort = (e) => {
    setSort(e.target.value);
    setPage(1);
  };

  const handlePrevious = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handleJoin = async (id) => {
    try {
      await dispatch(joinCommunity(id)).unwrap();

      dispatch(
        fetchCommunities({
          search,
          sort,
          page,
          limit,
        })
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleLeave = async (id) => {
    try {
      await dispatch(leaveCommunity(id)).unwrap();

      if (selectedCommunity?._id === id) {
        setSelectedCommunity(null);
        setResources([]);
      }

      dispatch(
        fetchCommunities({
          search,
          sort,
          page,
          limit,
        })
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();

    setCreateError("");

    try {
      await dispatch(
        createCommunity({
          name: communityName,
          description: communityDescription,
        })
      ).unwrap();

      setCommunityName("");
      setCommunityDescription("");

      dispatch(
        fetchCommunities({
          search,
          sort,
          page,
          limit,
        })
      );
    } catch (error) {
      setCreateError(error);
    }
  };

  const fetchResources = async (communityId) => {
    try {
      setResourceError("");

      const token = localStorage.getItem("token");

      const response = await api.get(
        `/api/communities/${communityId}/resources`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResources(response.data.resources || []);
    } catch (error) {
      setResourceError(
        error.response?.data?.message ||
          "Failed to fetch resources"
      );
    }
  };

  const handleOpenCommunity = async (community) => {
    setSelectedCommunity(community);
    setResources([]);
    setResourceTitle("");
    setResourceFile(null);
    setResourceMessage("");
    setResourceError("");

    await fetchResources(community._id);
  };

  const handleUploadResource = async (e) => {
    e.preventDefault();

    setResourceMessage("");
    setResourceError("");

    if (!resourceTitle.trim()) {
      setResourceError("Resource title is required");
      return;
    }

    if (!resourceFile) {
      setResourceError("Please select a file");
      return;
    }

    try {
      setResourceLoading(true);

      const token = localStorage.getItem("token");

      const formData = new FormData();

      formData.append("title", resourceTitle);
      formData.append("file", resourceFile);

      const response = await api.post(
        `/api/communities/${selectedCommunity._id}/resources`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResources((previousResources) => [
        response.data.resource,
        ...previousResources,
      ]);

      setResourceTitle("");
      setResourceFile(null);

      const fileInput =
        document.getElementById("community-resource-file");

      if (fileInput) {
        fileInput.value = "";
      }

      setResourceMessage(
        response.data.message ||
          "Learning resource uploaded successfully"
      );
    } catch (error) {
      setResourceError(
        error.response?.data?.message ||
          "Failed to upload resource"
      );
    } finally {
      setResourceLoading(false);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this resource?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setResourceError("");
      setResourceMessage("");

      const token = localStorage.getItem("token");

      const response = await api.delete(
        `/api/communities/${selectedCommunity._id}/resources/${resourceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResources((previousResources) =>
        previousResources.filter(
          (resource) => resource._id !== resourceId
        )
      );

      setResourceMessage(
        response.data.message ||
          "Learning resource deleted successfully"
      );
    } catch (error) {
      setResourceError(
        error.response?.data?.message ||
          "Failed to delete resource"
      );
    }
  };

  if (selectedCommunity) {
    return (
      <div className="community-details-page">
        <button
          type="button"
          onClick={() => {
            setSelectedCommunity(null);
            setResources([]);
            setResourceMessage("");
            setResourceError("");
          }}
        >
          Back to Communities
        </button>

        <h1>{selectedCommunity.name}</h1>

        <p>{selectedCommunity.description}</p>

        <p>
          Mentor:{" "}
          {selectedCommunity.mentor?.name || "Not available"}
        </p>

        <p>
          Mentor Email:{" "}
          {selectedCommunity.mentor?.email || "Not available"}
        </p>

        <p>
          Members:{" "}
          {selectedCommunity.members?.length || 0}
        </p>

        <p>
          Created:{" "}
          {new Date(
            selectedCommunity.createdAt
          ).toLocaleDateString()}
        </p>

        <hr />

        <h2>Community Posts</h2>
        <p>Posts and announcements will be added here.</p>

        <h2>Community Resources</h2>

        {user?.role === "user" && (
          <div className="resource-upload-section">
            <h3>Upload Learning Resource</h3>

            <form onSubmit={handleUploadResource}>
              <input
                type="text"
                placeholder="Resource title"
                value={resourceTitle}
                onChange={(e) =>
                  setResourceTitle(e.target.value)
                }
                required
              />

              <input
                id="community-resource-file"
                type="file"
                onChange={(e) =>
                  setResourceFile(e.target.files[0])
                }
                required
              />

              <button
                type="submit"
                disabled={resourceLoading}
              >
                {resourceLoading
                  ? "Uploading..."
                  : "Upload Resource"}
              </button>
            </form>
          </div>
        )}

        {resourceMessage && (
          <p>{resourceMessage}</p>
        )}

        {resourceError && (
          <p>{resourceError}</p>
        )}

        <div className="resources-list">
          {resources.length === 0 ? (
            <p>No resources found.</p>
          ) : (
            resources.map((resource) => {
              const uploaderId =
                resource.uploadedBy?._id ||
                resource.uploadedBy;

              const isUploader =
                uploaderId?.toString() ===
                user?.id?.toString();

              return (
                <div
                  className="resource-card"
                  key={resource._id}
                >
                  <h3>{resource.title}</h3>

                  <p>
  Uploaded by:{" "}
  {resource.uploadedBy?.name ||
    (resource.uploadedBy === user?.id
      ? user.name
      : "Unknown user")}
</p>
                  <a
                    href={resource.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open Resource
                  </a>

                  {isUploader && (
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteResource(
                          resource._id
                        )
                      }
                    >
                      Delete
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        <h2>Community Members</h2>

        {selectedCommunity.members?.length === 0 ? (
          <p>No members found.</p>
        ) : (
          <div>
            {selectedCommunity.members?.map(
              (member) => (
                <div key={member._id}>
                  <p>{member.name}</p>
                  <p>{member.email}</p>
                </div>
              )
            )}
          </div>
        )}

        {user?.role === "user" && (
          <button
            type="button"
            onClick={() =>
              handleLeave(selectedCommunity._id)
            }
          >
            Leave Community
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="communities-page">
      <h1>Communities</h1>

      {user?.role === "mentor" && (
        <div className="create-community">
          <h2>Create Community</h2>

          <form onSubmit={handleCreateCommunity}>
            <input
              type="text"
              placeholder="Community name"
              value={communityName}
              onChange={(e) =>
                setCommunityName(e.target.value)
              }
              required
            />

            <textarea
              placeholder="Community description"
              value={communityDescription}
              onChange={(e) =>
                setCommunityDescription(e.target.value)
              }
              required
            />

            <button type="submit">
              Create Community
            </button>
          </form>

          {createError && <p>{createError}</p>}
        </div>
      )}

      <p>
        {user?.role === "admin"
          ? "Manage platform communities"
          : user?.role === "mentor"
          ? "Manage your communities"
          : "Explore and join communities"}
      </p>

      <div className="community-filters">
        <input
          type="text"
          placeholder="Search communities"
          value={search}
          onChange={handleSearch}
        />

        <select
          value={sort}
          onChange={handleSort}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name_asc">Name A-Z</option>
          <option value="name_desc">Name Z-A</option>
        </select>
      </div>

      <p>
        Total Communities: {totalCommunities}
      </p>

      {error && <p>{error}</p>}

      {!loading && communities.length === 0 && (
        <p>No communities found.</p>
      )}

      <div className="communities-list">
        {communities.map((community) => {
          const isMember = community.members?.some(
            (member) =>
              member._id?.toString() ===
              user?.id?.toString()
          );

          return (
            <div
              className="community-card"
              key={community._id}
            >
              <h2>{community.name}</h2>

              <p>{community.description}</p>

              <p>
                Mentor:{" "}
                {community.mentor?.name ||
                  "Not available"}
              </p>

              <p>
                Mentor Email:{" "}
                {community.mentor?.email ||
                  "Not available"}
              </p>

              <p>
                Members:{" "}
                {community.members?.length || 0}
              </p>

              <p>
                Created:{" "}
                {new Date(
                  community.createdAt
                ).toLocaleDateString()}
              </p>

              {user?.role === "user" && (
                <>
                  {isMember ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenCommunity(
                            community
                          )
                        }
                      >
                        Open Community
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleLeave(
                            community._id
                          )
                        }
                      >
                        Leave Community
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        handleJoin(
                          community._id
                        )
                      }
                    >
                      Join Community
                    </button>
                  )}
                </>
              )}

              {user?.role === "mentor" && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/communities/${community._id}/manage`
                    )
                  }
                >
                  Manage Community
                </button>
              )}

              {user?.role === "admin" && (
                <button type="button">
                  View Community
                </button>
              )}
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            type="button"
            disabled={page === 1}
            onClick={handlePrevious}
          >
            Previous
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            disabled={page === totalPages}
            onClick={handleNext}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default Communities;