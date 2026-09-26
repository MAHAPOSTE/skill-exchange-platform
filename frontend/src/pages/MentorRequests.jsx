import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMentorRequests,
  approveMentorRequest,
  rejectMentorRequest,
} from "../store/mentorRequestsSlice";

function MentorRequests() {
  const dispatch = useDispatch();

  const { requests, loading, error } = useSelector(
    (state) => state.mentorRequests
  );

  useEffect(() => {
    dispatch(fetchMentorRequests());
  }, [dispatch]);

  const handleApprove = (id) => {
    dispatch(approveMentorRequest(id));
  };

  const handleReject = (id) => {
    dispatch(rejectMentorRequest(id));
  };

  if (loading) {
    return <h2>Loading mentor requests...</h2>;
  }

  return (
    <div className="mentor-requests-page">
      <h1>Mentor Requests</h1>
      <p>Review and manage mentor requests</p>

      {error && <p>{error}</p>}

      {requests.length === 0 ? (
        <p>No mentor requests found.</p>
      ) : (
        <div className="mentor-requests-list">
          {requests.map((request) => (
            <div className="mentor-request-card" key={request._id}>
              <h2>
                {request.user?.name || request.user?.email}
              </h2>

              <p>
                Email: {request.user?.email}
              </p>

              <p>
                Current Role: {request.user?.role}
              </p>

              <p>
                Status: {request.status}
              </p>

              {request.status === "pending" && (
  <div>
    <button
      type="button"
      onClick={() => handleApprove(request._id)}
    >
      Approve
    </button>

    <button
      type="button"
      onClick={() => handleReject(request._id)}
    >
      Reject
    </button>
  </div>
)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MentorRequests;