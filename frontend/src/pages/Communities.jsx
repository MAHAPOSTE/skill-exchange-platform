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
      <div className="mx-auto w-full max-w-7xl space-y-7 p-4 sm:p-6 lg:p-8">
        <button
          type="button"
          onClick={() => {
            setSelectedCommunity(null);
            setResources([]);
            setResourceMessage("");
            setResourceError("");
          }}
          className="mb-3 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back to Communities
        </button>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{selectedCommunity.name}</h1>

        <p className="text-sm leading-6 text-slate-600">{selectedCommunity.description}</p>

        <p className="text-sm leading-6 text-slate-600">
          Mentor:{" "}
          {selectedCommunity.mentor?.name || "Not available"}
        </p>

        <p className="text-sm leading-6 text-slate-600">
          Mentor Email:{" "}
          {selectedCommunity.mentor?.email || "Not available"}
        </p>

        <p className="text-sm leading-6 text-slate-600">
          Members:{" "}
          {selectedCommunity.members?.length || 0}
        </p>

        <p className="text-sm leading-6 text-slate-600">
          Created:{" "}
          {new Date(
            selectedCommunity.createdAt
          ).toLocaleDateString()}
        </p>

        <hr  className="my-6 border-slate-200" />

        <h2 className="mt-2 text-xl font-semibold text-slate-900">Community Posts</h2>
        <p className="text-sm leading-6 text-slate-600">Posts and announcements will be added here.</p>

        <h2 className="mt-2 text-xl font-semibold text-slate-900">Community Resources</h2>

        {user?.role === "user" && (
          <div className="my-5 rounded-2xl border border-violet-100 bg-violet-50/50 p-4 sm:p-5">
            <h3 className="text-base font-semibold text-slate-900">Upload Learning Resource</h3>

            <form onSubmit={handleUploadResource} className="mt-4 space-y-4">
              <input
                type="text"
                placeholder="Resource title"
                value={resourceTitle}
                onChange={(e) => setResourceTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                required
              />

              <input
                id="community-resource-file"
                type="file"
                onChange={(e) => setResourceFile(e.target.files[0])}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                required
              />

              <button
                type="submit"
                disabled={resourceLoading}
               className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-50">
                {resourceLoading
                  ? "Uploading..."
                  : "Upload Resource"}
              </button>
            </form>
          </div>
        )}

        {resourceMessage && (
          <p className="text-sm leading-6 text-slate-600">{resourceMessage}</p>
        )}

        {resourceError && (
          <p className="text-sm leading-6 text-slate-600">{resourceError}</p>
        )}

        <div className="my-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {resources.length === 0 ? (
            <p className="text-sm leading-6 text-slate-600">No resources found.</p>
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
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  key={resource._id}
                >
                  <h3 className="text-base font-semibold text-slate-900">{resource.title}</h3>

                  <p className="text-sm leading-6 text-slate-600">
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
                   className="inline-flex w-fit items-center rounded-lg bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100">
                    Open Resource
                  </a>

                  {isUploader && (
                    <button
                      type="button"
                      onClick={() => handleDeleteResource(resource._id)}
                      className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Delete
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        <h2 className="mt-2 text-xl font-semibold text-slate-900">Community Members</h2>

        {selectedCommunity.members?.length === 0 ? (
          <p className="text-sm leading-6 text-slate-600">No members found.</p>
        ) : (
          <div>
            {selectedCommunity.members?.map(
              (member) => (
                <div key={member._id}>
                  <p className="text-sm leading-6 text-slate-600">{member.name}</p>
                  <p className="text-sm leading-6 text-slate-600">{member.email}</p>
                </div>
              )
            )}
          </div>
        )}

        {user?.role === "user" && (
          <button
            type="button"
            onClick={() => handleLeave(selectedCommunity._id)}
            className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Leave Community
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7 p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Communities</h1>

      {user?.role === "mentor" && (
        <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mt-2 text-xl font-semibold text-slate-900">Create Community</h2>

          <form onSubmit={handleCreateCommunity} className="mt-4 space-y-4">
            <input
              type="text"
              placeholder="Community name"
              value={communityName}
              onChange={(e) => setCommunityName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              required
            />

            <textarea
              placeholder="Community description"
              value={communityDescription}
              onChange={(e) => setCommunityDescription(e.target.value)}
              className="w-full min-h-28 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              required
            />

            <button type="submit" className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-50">
              Create Community
            </button>
          </form>

          {createError && <p className="text-sm leading-6 text-slate-600">{createError}</p>}
        </div>
      )}

      <p className="text-sm leading-6 text-slate-600">
        {user?.role === "admin"
          ? "Manage platform communities"
          : user?.role === "mentor"
          ? "Manage your communities"
          : "Explore and join communities"}
      </p>

      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_220px]">
        <input
          type="text"
          placeholder="Search communities"
          value={search}
          onChange={handleSearch}
         className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100" />

        <select
          value={sort}
          onChange={handleSort}
         className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name_asc">Name A-Z</option>
          <option value="name_desc">Name Z-A</option>
        </select>
      </div>

      <p className="text-sm leading-6 text-slate-600">
        Total Communities: {totalCommunities}
      </p>

      {error && <p className="text-sm leading-6 text-slate-600">{error}</p>}

      {!loading && communities.length === 0 && (
        <p className="text-sm leading-6 text-slate-600">No communities found.</p>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {communities.map((community) => {
          const isMember = community.members?.some(
            (member) =>
              member._id?.toString() ===
              user?.id?.toString()
          );

          return (
            <div
              className="flex h-full flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              key={community._id}
            >
              <h2 className="mt-2 text-xl font-semibold text-slate-900">{community.name}</h2>

              <p className="text-sm leading-6 text-slate-600">{community.description}</p>

              <p className="text-sm leading-6 text-slate-600">
                Mentor:{" "}
                {community.mentor?.name ||
                  "Not available"}
              </p>

              <p className="text-sm leading-6 text-slate-600">
                Mentor Email:{" "}
                {community.mentor?.email ||
                  "Not available"}
              </p>

              <p className="text-sm leading-6 text-slate-600">
                Members:{" "}
                {community.members?.length || 0}
              </p>

              <p className="text-sm leading-6 text-slate-600">
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
                        onClick={() => handleOpenCommunity(community)}
                        className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Open Community
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLeave(community._id)}
                        className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Leave Community
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleJoin(community._id)}
                      className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Join Community
                    </button>
                  )}
                </>
              )}

              {user?.role === "mentor" && (
                <button
                  type="button"
                  onClick={() => navigate(`/communities/${community._id}/manage`)}
                  className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Manage Community
                </button>
              )}

              {user?.role === "admin" && (
                <button type="button" className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-50">
                  View Community
                </button>
              )}
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-4 py-5">
          <button
            type="button"
            disabled={page === 1}
            onClick={handlePrevious}
           className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-50">
            Previous
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            disabled={page === totalPages}
            onClick={handleNext}
           className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-50">
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default Communities;