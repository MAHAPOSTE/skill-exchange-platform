import { useCallback, useEffect, useState } from "react";
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

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";

function getErrorMessage(result, fallback) {
  const payload = result?.payload;

  if (typeof payload === "string") {
    return payload;
  }

  return (
    payload?.message ||
    result?.error?.message ||
    fallback
  );
}

function getLocalDateValue(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getStatusVariant(status) {
  switch (status) {
    case "completed":
      return "default";
    case "cancelled":
    case "rejected":
      return "destructive";
    case "scheduled":
    case "accepted":
      return "secondary";
    default:
      return "outline";
  }
}

function Sessions() {
  const dispatch = useDispatch();
  const { user } = useOutletContext();

  const {
    sessions = [],
    loading,
    error,
  } = useSelector((state) => state.sessions);

  const userId = String(user?._id || user?.id || "");
  const isAdmin = user?.role === "admin";

  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [requestLoading, setRequestLoading] = useState(true);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [editingSession, setEditingSession] = useState(null);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [requestError, setRequestError] = useState("");

  const today = getLocalDateValue(new Date());

  const fetchAcceptedRequests = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setRequestLoading(true);
      }

      setRequestError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [sentResponse, receivedResponse] = await Promise.all([
        api.get("/api/skill-exchange-requests/sent", { headers }),
        api.get("/api/skill-exchange-requests/received", { headers }),
      ]);

      const sentRequests = sentResponse.data.requests || [];
      const receivedRequests = receivedResponse.data.requests || [];

      const accepted = [
        ...sentRequests,
        ...receivedRequests,
      ].filter((request) => request.status === "accepted");

      const uniqueRequests = [
        ...new Map(
          accepted.map((request) => [request._id, request])
        ).values(),
      ];

      setAcceptedRequests(uniqueRequests);
    } catch (err) {
      setRequestError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load accepted exchange requests."
      );
    } finally {
      if (showLoading) {
        setRequestLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    dispatch(fetchSessions());
    fetchAcceptedRequests();
  }, [dispatch, fetchAcceptedRequests]);

  const clearMessages = () => {
    setSuccessMessage("");
    setRequestError("");
  };

  const resetForm = () => {
    setSelectedRequest(null);
    setEditingSession(null);
    setDate("");
    setTime("");
    setMeetingLink("");
  };

  const handleSchedule = (request) => {
    clearMessages();
    setEditingSession(null);
    setSelectedRequest(request);
    setDate("");
    setTime("");
    setMeetingLink("");
  };

  const handleEdit = (session) => {
    if (isAdmin) return;

    clearMessages();
    setSelectedRequest(null);
    setEditingSession(session);
    setDate(getLocalDateValue(session.date));
    setTime(session.time || "");
    setMeetingLink(session.meetingLink || "");
  };

  const hasSessionForRequest = (requestId) => {
    return sessions.some((session) => {
      const existingRequestId =
        session.exchangeRequest?._id ||
        session.exchangeRequest;

      return String(existingRequestId || "") === String(requestId);
    });
  };

  const getOtherParticipant = (session) => {
    const mentorId = String(
      session.mentor?._id || session.mentor?.id || ""
    );

    const learnerId = String(
      session.learner?._id || session.learner?.id || ""
    );

    if (mentorId === userId) return session.learner;
    if (learnerId === userId) return session.mentor;

    return session.mentor || session.learner;
  };

  const handleCreateSession = async (event) => {
    event.preventDefault();

    if (!selectedRequest || submitting) return;

    clearMessages();
    setSubmitting(true);

    try {
      const result = await dispatch(
        createSession({
          exchangeRequest: selectedRequest._id,
          date,
          time,
          meetingLink: meetingLink.trim(),
        })
      );

      if (!createSession.fulfilled.match(result)) {
        setRequestError(
          getErrorMessage(result, "Failed to schedule the session.")
        );
        return;
      }

      setSuccessMessage("Session scheduled successfully.");
      resetForm();

      await Promise.all([
        dispatch(fetchSessions()),
        fetchAcceptedRequests(false),
      ]);
    } catch {
      setRequestError("An unexpected error occurred while scheduling.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSession = async (event) => {
    event.preventDefault();

    if (!editingSession || submitting) return;

    clearMessages();
    setSubmitting(true);

    try {
      const result = await dispatch(
        updateSession({
          id: editingSession._id,
          date,
          time,
          meetingLink: meetingLink.trim(),
        })
      );

      if (!updateSession.fulfilled.match(result)) {
        setRequestError(
          getErrorMessage(result, "Failed to update the session.")
        );
        return;
      }

      setSuccessMessage("Session updated successfully.");
      resetForm();
      await dispatch(fetchSessions());
    } catch {
      setRequestError("An unexpected error occurred while updating.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSessionAction = async (session, action) => {
    if (isAdmin || processingId || session.status !== "scheduled") {
      return;
    }

    const actionConfig = {
      cancel: {
        thunk: cancelSession,
        success: "Session cancelled successfully.",
        error: "Failed to cancel the session.",
      },
      complete: {
        thunk: completeSession,
        success: "Session marked as completed.",
        error: "Failed to complete the session.",
      },
    };

    const config = actionConfig[action];

    if (!config) return;

    if (
      action === "cancel" &&
      !window.confirm("Are you sure you want to cancel this session?")
    ) {
      return;
    }

    clearMessages();
    setProcessingId(session._id);

    try {
      const result = await dispatch(config.thunk(session._id));

      if (!config.thunk.fulfilled.match(result)) {
        setRequestError(getErrorMessage(result, config.error));
        return;
      }

      setSuccessMessage(config.success);
      await dispatch(fetchSessions());
    } catch {
      setRequestError("An unexpected error occurred. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const isInitialLoading = loading && sessions.length === 0;

  if (isInitialLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <p className="text-muted-foreground">Loading sessions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sessions</h1>
        <p className="mt-1 text-muted-foreground">
          Schedule and manage your skill exchange sessions.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {typeof error === "string"
            ? error
            : error.message || "Failed to load sessions."}
        </div>
      )}

      {requestError && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {requestError}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="rounded-md border border-green-600/30 bg-green-600/5 p-3 text-sm text-green-700"
        >
          {successMessage}
        </div>
      )}

      {!isAdmin && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">
              Accepted Exchange Requests
            </h2>
            <p className="text-sm text-muted-foreground">
              Choose an accepted request to schedule a session.
            </p>
          </div>

          {requestLoading ? (
            <p className="text-muted-foreground">
              Loading accepted requests...
            </p>
          ) : acceptedRequests.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No accepted exchange requests are available for scheduling.
                Accept an exchange request first.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {acceptedRequests.map((request) => {
                const senderId = String(
                  request.sender?._id || request.sender?.id || ""
                );

                const otherPerson =
                  senderId === userId
                    ? request.receiver
                    : request.sender;

                const alreadyScheduled = hasSessionForRequest(request._id);

                return (
                  <Card key={request._id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-lg">
                            Skill exchange with{" "}
                            {otherPerson?.name || "Unknown user"}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {otherPerson?.email || "Email unavailable"}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">Accepted</Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <p>
                        <span className="text-muted-foreground">
                          Requested skill:{" "}
                        </span>
                        {request.requestedSkill?.name || "Unavailable"}
                      </p>

                      {request.offeredSkill && (
                        <p>
                          <span className="text-muted-foreground">
                            Offered skill:{" "}
                          </span>
                          {request.offeredSkill.name}
                        </p>
                      )}

                      {alreadyScheduled ? (
                        <p className="text-sm text-muted-foreground">
                          A session has already been scheduled for this request.
                        </p>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => handleSchedule(request)}
                          disabled={submitting || processingId !== null}
                        >
                          Schedule Session
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      )}

      {(selectedRequest || editingSession) && !isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingSession ? "Update Session" : "Schedule Session"}
            </CardTitle>
            <CardDescription>
              {editingSession
                ? "Update the date, time, or meeting link."
                : "Enter the details for your skill exchange session."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {selectedRequest && (
              <p className="mb-5 text-sm text-muted-foreground">
                Exchange with:{" "}
                <span className="font-medium text-foreground">
                  {(() => {
                    const senderId = String(
                      selectedRequest.sender?._id ||
                        selectedRequest.sender?.id ||
                        ""
                    );

                    return senderId === userId
                      ? selectedRequest.receiver?.name
                      : selectedRequest.sender?.name;
                  })()}
                </span>
              </p>
            )}

            <form
              onSubmit={
                editingSession
                  ? handleUpdateSession
                  : handleCreateSession
              }
              className="grid grid-cols-1 gap-5 sm:grid-cols-2"
            >
              <div className="space-y-2">
                <Label htmlFor="session-date">Date</Label>
                <Input
                  id="session-date"
                  type="date"
                  value={date}
                  min={today}
                  onChange={(event) => setDate(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="session-time">Time</Label>
                <Input
                  id="session-time"
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="meeting-link">
                  Meeting Link (optional)
                </Label>
                <Input
                  id="meeting-link"
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={meetingLink}
                  onChange={(event) => setMeetingLink(event.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-3 sm:col-span-2">
                <Button type="submit" disabled={submitting}>
                  {submitting
                    ? "Saving..."
                    : editingSession
                      ? "Update Session"
                      : "Schedule Session"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  disabled={submitting}
                  onClick={resetForm}
                >
                  Close
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">
            {isAdmin ? "All Available Session Records" : "My Sessions"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? "View session details. Management actions are disabled for administrators."
              : "View and manage your scheduled sessions."}
          </p>
        </div>

        {sessions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No sessions scheduled yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {sessions.map((session) => {
              const otherParticipant = getOtherParticipant(session);
              const isProcessing = processingId === session._id;

              return (
                <Card key={session._id}>
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg">
                          Session with{" "}
                          {otherParticipant?.name || "Unknown participant"}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {otherParticipant?.email || "Email unavailable"}
                        </CardDescription>
                      </div>

                      <Badge variant={getStatusVariant(session.status)}>
                        {session.status || "Unknown"}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <p>
                      <span className="text-muted-foreground">Mentor: </span>
                      {session.mentor?.name || "Unavailable"}
                    </p>

                    <p>
                      <span className="text-muted-foreground">Learner: </span>
                      {session.learner?.name || "Unavailable"}
                    </p>

                    <p>
                      <span className="text-muted-foreground">Date: </span>
                      {session.date
                        ? new Date(session.date).toLocaleDateString()
                        : "Not set"}
                    </p>

                    <p>
                      <span className="text-muted-foreground">Time: </span>
                      {session.time || "Not set"}
                    </p>

                    {session.meetingLink && (
                      <p>
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline underline-offset-4"
                        >
                          Join Meeting
                        </a>
                      </p>
                    )}

                    {!isAdmin && session.status === "scheduled" && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={processingId !== null || submitting}
                          onClick={() => handleEdit(session)}
                        >
                          Edit
                        </Button>

                        <Button
                          type="button"
                          variant="destructive"
                          disabled={processingId !== null || submitting}
                          onClick={() =>
                            handleSessionAction(session, "cancel")
                          }
                        >
                          {isProcessing ? "Processing..." : "Cancel"}
                        </Button>

                        <Button
                          type="button"
                          disabled={processingId !== null || submitting}
                          onClick={() =>
                            handleSessionAction(session, "complete")
                          }
                        >
                          {isProcessing ? "Processing..." : "Mark Complete"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Sessions;