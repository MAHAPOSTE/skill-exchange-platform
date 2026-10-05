import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import api from "../api";
import {
  fetchSessions,
  createSession,
  updateSession,
  cancelSession,
  completeSession,
} from "../store/sessionSlice";

function Sessions() {
  const dispatch = useDispatch();
  const { user } = useOutletContext();

  const {
    sessions,
    loading,
    error,
  } = useSelector((state) => state.sessions);

  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [requestLoading, setRequestLoading] = useState(true);

  const [selectedRequest, setSelectedRequest] = useState(null);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("");

  const [editingSession, setEditingSession] = useState(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    dispatch(fetchSessions());
    fetchAcceptedRequests();
  }, [dispatch]);

  const fetchAcceptedRequests = async () => {
    try {
      setRequestLoading(true);
      setRequestError("");

      const token = localStorage.getItem("token");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [sentResponse, receivedResponse] = await Promise.all([
        api.get("/api/skill-exchange-requests/sent", {
          headers,
        }),
        api.get("/api/skill-exchange-requests/received", {
          headers,
        }),
      ]);

      const sentAccepted = sentResponse.data.requests.filter(
        (request) => request.status === "accepted"
      );

      const receivedAccepted =
        receivedResponse.data.requests.filter(
          (request) => request.status === "accepted"
        );

      const allAccepted = [
        ...sentAccepted,
        ...receivedAccepted,
      ];

      const uniqueRequests = allAccepted.filter(
        (request, index, array) =>
          index ===
          array.findIndex(
            (item) => item._id === request._id
          )
      );

      setAcceptedRequests(uniqueRequests);
    } catch (error) {
      setRequestError(
        error.response?.data?.message ||
          "Failed to load accepted exchange requests"
      );
    } finally {
      setRequestLoading(false);
    }
  };

  const handleSchedule = (request) => {
    setSelectedRequest(request);
    setEditingSession(null);
    setDate("");
    setTime("");
    setMeetingLink("");
    setSuccessMessage("");
    setRequestError("");
  };

  const handleCancelForm = () => {
    setSelectedRequest(null);
    setEditingSession(null);
    setDate("");
    setTime("");
    setMeetingLink("");
    setSuccessMessage("");
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();

    if (!selectedRequest) {
      return;
    }

    setSuccessMessage("");
    setRequestError("");

    const result = await dispatch(
      createSession({
        exchangeRequest: selectedRequest._id,
        date,
        time,
        meetingLink,
      })
    );

    if (createSession.fulfilled.match(result)) {
      setSuccessMessage(
        "Session scheduled successfully"
      );

      setSelectedRequest(null);
      setDate("");
      setTime("");
      setMeetingLink("");

      fetchAcceptedRequests();
    }
  };

  const handleEdit = (session) => {
    setEditingSession(session);
    setSelectedRequest(null);

    const sessionDate = new Date(session.date);

    const formattedDate = sessionDate
      .toISOString()
      .split("T")[0];

    setDate(formattedDate);
    setTime(session.time);
    setMeetingLink(session.meetingLink || "");

    setSuccessMessage("");
    setRequestError("");
  };

  const handleUpdateSession = async (e) => {
    e.preventDefault();

    if (!editingSession) {
      return;
    }

    setSuccessMessage("");
    setRequestError("");

    const result = await dispatch(
      updateSession({
        id: editingSession._id,
        date,
        time,
        meetingLink,
      })
    );

    if (updateSession.fulfilled.match(result)) {
      setSuccessMessage(
        "Session updated successfully"
      );

      setEditingSession(null);
      setDate("");
      setTime("");
      setMeetingLink("");
    }
  };

  const handleCancelSession = async (id) => {
    setSuccessMessage("");
    setRequestError("");

    const result = await dispatch(cancelSession(id));

    if (cancelSession.fulfilled.match(result)) {
      setSuccessMessage(
        "Session cancelled successfully"
      );
    }
  };

  const handleCompleteSession = async (id) => {
    setSuccessMessage("");
    setRequestError("");

    const result = await dispatch(completeSession(id));

    if (completeSession.fulfilled.match(result)) {
      setSuccessMessage(
        "Session marked as completed"
      );
    }
  };

  const hasSessionForRequest = (requestId) => {
    return sessions.some(
      (session) =>
        session.exchangeRequest?._id === requestId ||
        session.exchangeRequest === requestId
    );
  };

  const getOtherParticipant = (session) => {
    if (session.mentor?._id === user?.id) {
      return session.learner;
    }

    return session.mentor;
  };

  if (loading && sessions.length === 0) {
    return <h2>Loading sessions...</h2>;
  }

  return (
    <div className="sessions-page">
      <h1>Sessions</h1>

      <p>
        Schedule and manage your skill exchange sessions.
      </p>

      {error && <p>{error}</p>}

      {requestError && <p>{requestError}</p>}

      {successMessage && (
        <p>{successMessage}</p>
      )}

      <div className="sessions-section">
        <h2>Accepted Exchange Requests</h2>

        {requestLoading ? (
          <p>Loading accepted requests...</p>
        ) : acceptedRequests.length === 0 ? (
          <p>
            No accepted exchange requests available
            for scheduling.
          </p>
        ) : (
          acceptedRequests.map((request) => {
            const alreadyScheduled =
              hasSessionForRequest(request._id);

            const otherPerson =
              request.sender?._id === user?.id
                ? request.receiver
                : request.sender;

            return (
              <div
                className="session-request-card"
                key={request._id}
              >
                <h3>
                  Skill Exchange with{" "}
                  {otherPerson?.name}
                </h3>

                <p>
                  Email: {otherPerson?.email}
                </p>

                <p>
                  Requested Skill:{" "}
                  {request.requestedSkill?.name}
                </p>

                {request.offeredSkill && (
                  <p>
                    Offered Skill:{" "}
                    {request.offeredSkill?.name}
                  </p>
                )}

                <p>
                  Request Status: {request.status}
                </p>

                {!alreadyScheduled ? (
                  <button
                    type="button"
                    onClick={() =>
                      handleSchedule(request)
                    }
                  >
                    Schedule Session
                  </button>
                ) : (
                  <p>Session already scheduled.</p>
                )}
              </div>
            );
          })
        )}
      </div>

      {(selectedRequest || editingSession) && (
        <div className="session-form-section">
          <h2>
            {editingSession
              ? "Update Session"
              : "Schedule Session"}
          </h2>

          {selectedRequest && (
            <p>
              Exchange with:{" "}
              <strong>
                {selectedRequest.sender?._id === user?.id
                  ? selectedRequest.receiver?.name
                  : selectedRequest.sender?.name}
              </strong>
            </p>
          )}

          <form
            onSubmit={
              editingSession
                ? handleUpdateSession
                : handleCreateSession
            }
          >
            <div>
              <label>Date</label>

              <input
                type="date"
                value={date}
                onChange={(e) =>
                  setDate(e.target.value)
                }
                required
              />
            </div>

            <div>
              <label>Time</label>

              <input
                type="time"
                value={time}
                onChange={(e) =>
                  setTime(e.target.value)
                }
                required
              />
            </div>

            <div>
              <label>Meeting Link</label>

              <input
                type="url"
                placeholder="https://meet.google.com/..."
                value={meetingLink}
                onChange={(e) =>
                  setMeetingLink(e.target.value)
                }
              />
            </div>

            <button type="submit">
              {editingSession
                ? "Update Session"
                : "Schedule Session"}
            </button>

            <button
              type="button"
              onClick={handleCancelForm}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      <div className="sessions-section">
        <h2>My Sessions</h2>

        {sessions.length === 0 ? (
          <p>No sessions scheduled.</p>
        ) : (
          sessions.map((session) => {
            const otherParticipant =
              getOtherParticipant(session);

            return (
              <div
                className="session-card"
                key={session._id}
              >
                <h3>
                  Session with{" "}
                  {otherParticipant?.name}
                </h3>

                <p>
                  Email: {otherParticipant?.email}
                </p>

                <p>
                  Mentor:{" "}
                  {session.mentor?.name}
                </p>

                <p>
                  Learner:{" "}
                  {session.learner?.name}
                </p>

                <p>
                  Date:{" "}
                  {new Date(
                    session.date
                  ).toLocaleDateString()}
                </p>

                <p>
                  Time: {session.time}
                </p>

                {session.meetingLink && (
                  <p>
                    Meeting Link:{" "}
                    <a
                      href={session.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Join Meeting
                    </a>
                  </p>
                )}

                <p>
                  Status: {session.status}
                </p>

                {session.status === "scheduled" && (
                  <div>
                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(session)
                      }
                    >
                      Update
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleCancelSession(
                          session._id
                        )
                      }
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleCompleteSession(
                          session._id
                        )
                      }
                    >
                      Mark Complete
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Sessions;