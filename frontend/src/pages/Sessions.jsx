import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";

import {
  cancelSession,
  completeSession,
  createSession,
  fetchAcceptedRequests,
  fetchSessions,
  updateSession,
} from "../store/sessionSlice";

function Sessions() {
  const dispatch = useDispatch();
  const { user } = useOutletContext();
  const {
    sessions = [],
    acceptedRequests = [],
    sentRequests = [],
    loading,
    error,
  } = useSelector((state) => state.sessions);

  const [formData, setFormData] = useState({
    exchangeRequest: "",
    date: "",
    time: "",
    meetingLink: "",
  });
  const [actionError, setActionError] = useState("");

  const isUser = user?.role === "user";
  const isMentor = user?.role === "mentor";
  const isAdmin = user?.role === "admin";
  const scheduledRequestIds = new Set(
    sessions
      .filter((session) => session.status === "scheduled")
      .map((session) =>
        typeof session.exchangeRequest === "object"
          ? session.exchangeRequest?._id
          : session.exchangeRequest
      )
  );
  const schedulableRequests = acceptedRequests.filter(
    (request) => !scheduledRequestIds.has(request._id)
  );

  useEffect(() => {
    if (!user?.role) return;

    dispatch(fetchSessions());
    if (isUser) {
      dispatch(fetchAcceptedRequests());
    }
  }, [dispatch, isUser, user?.role]);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSchedule = async (event) => {
    event.preventDefault();
    setActionError("");

    const result = await dispatch(createSession(formData));
    if (createSession.fulfilled.match(result)) {
      setFormData({
        exchangeRequest: "",
        date: "",
        time: "",
        meetingLink: "",
      });
      dispatch(fetchSessions());
    } else {
      setActionError(result.payload || "Failed to schedule session");
    }
  };

  const handleUpdate = async (session) => {
    setActionError("");
    const date = window.prompt(
      "Enter new date (YYYY-MM-DD):",
      session.date ? new Date(session.date).toISOString().slice(0, 10) : ""
    );
    if (!date) return;

    const time = window.prompt("Enter new time:", session.time || "");
    if (!time) return;

    const meetingLink = window.prompt(
      "Enter meeting link:",
      session.meetingLink || ""
    );
    if (meetingLink === null) return;

    const result = await dispatch(
      updateSession({ id: session._id, date, time, meetingLink })
    );
    if (!updateSession.fulfilled.match(result)) {
      setActionError(result.payload || "Failed to update session");
    }
  };

  const handleSessionAction = async (action, id, confirmation) => {
    if (!window.confirm(confirmation)) return;
    setActionError("");

    const result = await dispatch(action(id));
    if (!action.fulfilled.match(result)) {
      setActionError(result.payload || "Failed to update session");
    }
  };

  const getRequestName = (request) =>
    request.receiver?.name || "Mentor";
  const canManageSession = (session) =>
    isMentor && session.status === "scheduled";

  return (
    <section className="sessions-page">
      <h1>Sessions</h1>

      {isUser && (
        <div className="session-schedule">
          <h2>Schedule a session</h2>
          {schedulableRequests.length === 0 ? (
            <p>
              {acceptedRequests.length === 0
                ? "No accepted exchange requests are available to schedule."
                : "All accepted exchanges already have a scheduled session."}
            </p>
          ) : (
            <form onSubmit={handleSchedule}>
              <label htmlFor="exchangeRequest">Accepted exchange</label>
              <select
                id="exchangeRequest"
                name="exchangeRequest"
                value={formData.exchangeRequest}
                onChange={handleChange}
                required
              >
                <option value="">Select an accepted exchange</option>
                {schedulableRequests.map((request) => (
                  <option key={request._id} value={request._id}>
                    Exchange with {getRequestName(request)}
                  </option>
                ))}
              </select>

              <label htmlFor="sessionDate">Date</label>
              <input
                id="sessionDate"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />

              <label htmlFor="sessionTime">Time</label>
              <input
                id="sessionTime"
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              />

              <label htmlFor="meetingLink">Meeting link (optional)</label>
              <input
                id="meetingLink"
                type="url"
                name="meetingLink"
                placeholder="https://..."
                value={formData.meetingLink}
                onChange={handleChange}
              />

              <button type="submit" disabled={loading}>
                Schedule session
              </button>
            </form>
          )}
        </div>
      )}

      {isUser && (
        <section className="sent-exchange-requests">
          <h2>Requests you sent</h2>
          {sentRequests.length === 0 ? (
            <p>You haven’t sent any exchange requests yet.</p>
          ) : (
            sentRequests.map((request) => (
              <article className="request-card" key={request._id}>
                <h3>
                  {request.requestedSkill?.name || "Skill exchange"} with{" "}
                  {request.receiver?.name || "another user"}
                </h3>
                <p>
                  <strong>Status:</strong> {request.status}
                </p>
                {request.message && (
                  <p>
                    <strong>Message:</strong> {request.message}
                  </p>
                )}
              </article>
            ))
          )}
        </section>
      )}

      <h2>{isAdmin || isMentor ? "All sessions" : "My sessions"}</h2>
      {loading && <p>Loading sessions...</p>}
      {(actionError || error) && <p role="alert">{actionError || error}</p>}

      {!loading && sessions.length === 0 ? (
        <p>No sessions found.</p>
      ) : (
        <div className="session-list">
          {sessions.map((session) => (
            <article className="session-card" key={session._id}>
              <h3>
                {session.mentor?.name || "Mentor"} and{" "}
                {session.learner?.name || "Learner"}
              </h3>
              <p>
                <strong>Date:</strong>{" "}
                {session.date
                  ? new Date(session.date).toLocaleDateString()
                  : "Not set"}
              </p>
              <p>
                <strong>Time:</strong> {session.time}
              </p>
              <p>
                <strong>Status:</strong> {session.status}
              </p>
              {session.meetingLink && (
                <p>
                  <strong>Meeting:</strong>{" "}
                  <a
                    href={session.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Join meeting
                  </a>
                </p>
              )}
              {session.exchangeRequest && (
                <p>
                  <strong>Exchange request:</strong>{" "}
                  {session.exchangeRequest._id || session.exchangeRequest}
                </p>
              )}

              {canManageSession(session) && (
                <div className="session-actions">
                  <button type="button" onClick={() => handleUpdate(session)}>
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleSessionAction(
                        cancelSession,
                        session._id,
                        "Are you sure you want to cancel this session?"
                      )
                    }
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleSessionAction(
                        completeSession,
                        session._id,
                        "Mark this session as completed?"
                      )
                    }
                  >
                    Complete
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Sessions;
