
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

function getLocalDateValue(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getErrorMessage(result, fallback) {
  return result?.payload || result?.error?.message || fallback;
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
  const isMentor = user?.role === "mentor";

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

  // Fetch sessions and accepted exchange requests
  useEffect(() => {
    dispatch(fetchSessions());

    const fetchRequests = async () => {
      if (isAdmin) {
        setRequestLoading(false);
        return;
      }

      try {
        setRequestLoading(true);
        setRequestError("");

        const [sentResponse, receivedResponse] = await Promise.all([
          api.get("/api/skill-exchange-requests/sent"),
          api.get("/api/skill-exchange-requests/received"),
        ]);

        const sentRequests = sentResponse.data.requests || [];
        const receivedRequests = receivedResponse.data.requests || [];

        const allRequests = [
          ...sentRequests,
          ...receivedRequests,
        ];

        const uniqueRequests = allRequests.filter(
          (request, index) =>
            allRequests.findIndex(
              (item) => item._id === request._id
            ) === index
        );

        setAcceptedRequests(
          uniqueRequests.filter(
            (request) => request.status === "accepted"
          )
        );
      } catch (error) {
        setRequestError(
          error.response?.data?.message ||
            "Failed to load accepted exchange requests."
        );
      } finally {
        setRequestLoading(false);
      }
    };

    fetchRequests();
  }, [dispatch, isAdmin]);

  const clearMessages = () => {
    setSuccessMessage("");
    setRequestError("");
  };

  // Reset form
  const resetForm = () => {
    setSelectedRequest(null);
    setEditingSession(null);
    setDate("");
    setTime("");
    setMeetingLink("");
  };

  // Select exchange request for scheduling
  const handleSchedule = (request) => {
    clearMessages();
    setEditingSession(null);
    setSelectedRequest(request);
    setDate("");
    setTime("");
    setMeetingLink("");
  };

  // Check whether a scheduled session already exists
  const hasSessionForRequest = (requestId) => {
    return sessions.some((session) => {
      const existingRequestId =
        session.exchangeRequest?._id ||
        session.exchangeRequest;

      return (
        String(existingRequestId) === String(requestId) &&
        session.status === "scheduled"
      );
    });
  };

  // Find the other participant
  const getOtherParticipant = (session) => {
    const mentorId = String(
      session.mentor?._id || session.mentor?.id || session.mentor || ""
    );

    const learnerId = String(
      session.learner?._id || session.learner?.id || session.learner || ""
    );

    if (mentorId === userId) return session.learner;
    if (learnerId === userId) return session.mentor;

    return session.mentor || session.learner;
  };

  // Check whether the logged-in mentor owns this session
  const isAssignedMentor = (session) => {
    const mentorId = String(
      session.mentor?._id || session.mentor?.id || session.mentor || ""
    );

    return isMentor && mentorId === userId;
  };

  // Create session
  const handleCreateSession = async (event) => {
    event.preventDefault();

    if (!isMentor || !selectedRequest || submitting) return;

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
          getErrorMessage(result, "Failed to schedule session.")
        );
        return;
      }

      setSuccessMessage("Session scheduled successfully.");
      resetForm();

      await dispatch(fetchSessions());
    } catch {
      setRequestError("Something went wrong while scheduling.");
    } finally {
      setSubmitting(false);
    }
  };

  // Edit session
  const handleEdit = (session) => {
    if (!isAssignedMentor(session)) return;

    clearMessages();

    setSelectedRequest(null);
    setEditingSession(session);

    setDate(getLocalDateValue(session.date));
    setTime(session.time || "");
    setMeetingLink(session.meetingLink || "");
  };

  // Update session
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
          getErrorMessage(result, "Failed to update session.")
        );
        return;
      }

      setSuccessMessage("Session updated successfully.");
      resetForm();

      await dispatch(fetchSessions());
    } catch {
      setRequestError("Something went wrong while updating.");
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel or complete session
  const handleSessionAction = async (session, action) => {
    if (
      !isAssignedMentor(session) ||
      processingId ||
      session.status !== "scheduled"
    ) {
      return;
    }

    if (
      action === "cancel" &&
      !window.confirm("Are you sure you want to cancel this session?")
    ) {
      return;
    }

    clearMessages();
    setProcessingId(session._id);

    try {
      const actionFunction =
        action === "cancel" ? cancelSession : completeSession;

      const result = await dispatch(actionFunction(session._id));

      if (!actionFunction.fulfilled.match(result)) {
        setRequestError(
          getErrorMessage(result, `Failed to ${action} session.`)
        );
        return;
      }

      setSuccessMessage(
        action === "cancel"
          ? "Session cancelled successfully."
          : "Session marked as completed."
      );

      await dispatch(fetchSessions());
    } catch {
      setRequestError("Something went wrong. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const isInitialLoading = loading && sessions.length === 0;

  return (
    <div className="space-y-8">

      {/* Page Heading */}
      <div className="rounded-2xl bg-[#142D4E] p-6 text-white shadow-sm sm:p-8">
        <p className="text-sm font-medium text-blue-200">
          SKILL EXCHANGE PLATFORM
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Sessions
        </h1>

        <p className="mt-2 max-w-xl text-sm text-blue-100">
          Schedule, track, and manage your skill exchange learning sessions.
        </p>
      </div>

      {/* Messages */}
      {(error || requestError) && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {requestError ||
            (typeof error === "string" ? error : "Failed to load sessions.")}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          {successMessage}
        </div>
      )}

      {/* Accepted Exchange Requests */}
      {isMentor && (
        <section className="space-y-4">

          <div>
            <h2 className="text-xl font-bold text-[#142D4E]">
              Accepted Exchange Requests
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Select an accepted exchange request to schedule a session.
            </p>
          </div>

          {requestLoading ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                Loading accepted requests...
              </CardContent>
            </Card>
          ) : acceptedRequests.length === 0 ? (
            <Card className="border-[#DCE4EF]">
              <CardContent className="p-8 text-center">
                <h3 className="font-semibold text-[#142D4E]">
                  No accepted requests available
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Accept a skill exchange request before scheduling a session.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

              {acceptedRequests.map((request) => {
                const senderId = String(
                  request.sender?._id || request.sender?.id || request.sender || ""
                );

                const otherPerson =
                  senderId === userId
                    ? request.receiver
                    : request.sender;

                const alreadyScheduled = hasSessionForRequest(request._id);

                return (
                  <Card
                    key={request._id}
                    className="border-[#DCE4EF] shadow-sm transition hover:shadow-md"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-lg text-[#142D4E]">
                            {otherPerson?.name || "Exchange participant"}
                          </CardTitle>

                          <CardDescription>
                            {otherPerson?.email || "Email unavailable"}
                          </CardDescription>
                        </div>

                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          Accepted
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">

                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-[#142D4E]">
                          Requested skill:
                        </span>{" "}
                        {request.requestedSkill?.name || "Not available"}
                      </p>

                      {request.offeredSkill && (
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold text-[#142D4E]">
                            Offered skill:
                          </span>{" "}
                          {request.offeredSkill.name}
                        </p>
                      )}

                      {alreadyScheduled ? (
                        <p className="text-sm text-gray-500">
                          A scheduled session already exists for this request.
                        </p>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => handleSchedule(request)}
                          disabled={submitting || processingId !== null}
                          className="bg-[#4F86F7] text-white hover:bg-[#3B73E6]"
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

      {/* Schedule / Edit Form */}
      {isMentor && (selectedRequest || editingSession) && (
        <Card className="border-[#DCE4EF] shadow-sm">

          <CardHeader>
            <CardTitle className="text-xl text-[#142D4E]">
              {editingSession ? "Update Session" : "Schedule Session"}
            </CardTitle>

            <CardDescription>
              {editingSession
                ? "Change the session date, time, or meeting link."
                : "Enter the details for your learning session."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={
                editingSession
                  ? handleUpdateSession
                  : handleCreateSession
              }
              className="grid grid-cols-1 gap-5 sm:grid-cols-2"
            >

              <div className="space-y-2">
                <Label htmlFor="session-date">Session Date</Label>

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
                <Label htmlFor="session-time">Session Time</Label>

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
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#4F86F7] text-white hover:bg-[#3B73E6]"
                >
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

      {/* Session Records */}
      <section className="space-y-4">

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[#142D4E]">
              {isAdmin ? "All Session Records" : "My Sessions"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {isAdmin
                ? "View all sessions across the platform."
                : "View your scheduled, completed, and cancelled sessions."}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => dispatch(fetchSessions())}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {isInitialLoading ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              Loading sessions...
            </CardContent>
          </Card>
        ) : sessions.length === 0 ? (
          <Card className="border-[#DCE4EF]">
            <CardContent className="p-10 text-center">
              <h3 className="font-semibold text-[#142D4E]">
                No sessions found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Your scheduled sessions will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

            {sessions.map((session) => {
              const otherParticipant = getOtherParticipant(session);
              const assignedMentor = isAssignedMentor(session);
              const isProcessing = processingId === session._id;

              return (
                <Card
                  key={session._id}
                  className="overflow-hidden border-[#DCE4EF] shadow-sm transition hover:shadow-md"
                >

                  <CardHeader className="bg-[#F3F6FA]">
                    <div className="flex flex-wrap items-start justify-between gap-3">

                      <div>
                        <CardTitle className="text-lg text-[#142D4E]">
                          Session with {otherParticipant?.name || "Participant"}
                        </CardTitle>

                        <CardDescription className="mt-1">
                          {otherParticipant?.email || "Email unavailable"}
                        </CardDescription>
                      </div>

                      <Badge
                        className={
                          session.status === "scheduled"
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                            : session.status === "completed"
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-200"
                        }
                      >
                        {session.status}
                      </Badge>

                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 p-5">

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">
                          Mentor
                        </p>

                        <p className="mt-1 font-medium text-[#142D4E]">
                          {session.mentor?.name || "Unavailable"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">
                          Learner
                        </p>

                        <p className="mt-1 font-medium text-[#142D4E]">
                          {session.learner?.name || "Unavailable"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">
                          Date
                        </p>

                        <p className="mt-1 text-sm text-gray-700">
                          {session.date
                            ? new Date(session.date).toLocaleDateString()
                            : "Not set"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">
                          Time
                        </p>

                        <p className="mt-1 text-sm text-gray-700">
                          {session.time || "Not set"}
                        </p>
                      </div>

                    </div>

                    {session.meetingLink && (
                      <a
                        href={session.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-sm font-semibold text-[#4F86F7] underline underline-offset-4 hover:text-[#3B73E6]"
                      >
                        Join Meeting
                      </a>
                    )}

                    {/* Only the assigned mentor can manage a session */}
                    {assignedMentor && session.status === "scheduled" && (
                      <div className="flex flex-wrap gap-2 border-t border-[#DCE4EF] pt-4">

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
                          className="bg-[#16A34A] text-white hover:bg-green-700"
                        >
                          {isProcessing ? "Processing..." : "Mark Complete"}
                        </Button>

                      </div>
                    )}

                    {!isAdmin && !assignedMentor && session.status === "scheduled" && (
                      <p className="border-t border-[#DCE4EF] pt-3 text-xs text-gray-500">
                        Only the assigned mentor can manage this session.
                      </p>
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
