import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import {
  fetchCommunities,
  joinCommunity,
  leaveCommunity,
  createCommunity,
} from "../store/communitiesSlice";

function Communities() {
  const dispatch = useDispatch();
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
        onChange={(e) => setCommunityName(e.target.value)}
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

        <select value={sort} onChange={handleSort}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name_asc">Name A-Z</option>
          <option value="name_desc">Name Z-A</option>
        </select>
      </div>

      <p>Total Communities: {totalCommunities}</p>

      {error && <p>{error}</p>}

      {!loading && communities.length === 0 && (
        <p>No communities found.</p>
      )}

      <div className="communities-list">
        {communities.map((community) => {
          const isMember = community.members?.some(
            (member) => member._id === user?._id
          );

          return (
            <div className="community-card" key={community._id}>
              <h2>{community.name}</h2>

              <p>{community.description}</p>

              <p>
                Mentor: {community.mentor?.name || "Not available"}
              </p>

              <p>
                Mentor Email:{" "}
                {community.mentor?.email || "Not available"}
              </p>

              <p>
                Members: {community.members?.length || 0}
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
                    <button
                      type="button"
                      onClick={() => handleLeave(community._id)}
                    >
                      Leave Community
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleJoin(community._id)}
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
                  window.location.href = `/communities/${community._id}/manage`
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