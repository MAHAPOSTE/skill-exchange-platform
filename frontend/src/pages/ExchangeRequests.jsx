import { useCallback, useEffect, useState } from "react";
import api from "../api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

function ExchangeRequests() {
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchRequests = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      setError("");

      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [receivedResponse, sentResponse] = await Promise.all([
        api.get("/api/skill-exchange-requests/received", { headers }),
        api.get("/api/skill-exchange-requests/sent", { headers }),
      ]);

      setReceivedRequests(receivedResponse.data.requests || []);
      setSentRequests(sentResponse.data.requests || []);

      return true;
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load exchange requests."
      );
      return false;
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchRequests(true);
  }, [fetchRequests]);

  const handleRequestAction = async (id, action) => {
    try {
      setProcessingRequestId(id);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      await api.put(
        `/api/skill-exchange-requests/${id}/${action}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(
        action === "accept"
          ? "Exchange request accepted successfully."
          : "Exchange request rejected successfully."
      );

      await fetchRequests();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          `Failed to ${action} exchange request.`
      );
    } finally {
      setProcessingRequestId(null);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "accepted":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const RequestCard = ({ request, type }) => {
    const person =
      type === "received" ? request.sender : request.receiver;

    const isProcessing = processingRequestId === request._id;

    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-lg">
                {type === "received" ? "From: " : "To: "}
                {person?.name || "Unknown user"}
              </CardTitle>

              <CardDescription className="mt-1">
                {person?.email || "Email unavailable"}
              </CardDescription>
            </div>

            <Badge variant={getStatusVariant(request.status)}>
              {request.status || "pending"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">
              Requested Skill
            </p>
            <p className="font-medium">
              {request.requestedSkill?.name || "Unavailable"}
            </p>

            {request.requestedSkill?.type && (
              <p className="text-sm text-muted-foreground">
                Type: {request.requestedSkill.type}
              </p>
            )}
          </div>

          {request.offeredSkill && (
            <div>
              <p className="text-sm text-muted-foreground">
                Offered Skill
              </p>
              <p className="font-medium">
                {request.offeredSkill.name || "Unavailable"}
              </p>
            </div>
          )}

          {request.message && (
            <div>
              <p className="text-sm text-muted-foreground">Message</p>
              <p className="whitespace-pre-wrap break-words text-sm">
                {request.message}
              </p>
            </div>
          )}

          {type === "received" && request.status === "pending" && (
            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                type="button"
                disabled={processingRequestId !== null}
                onClick={() =>
                  handleRequestAction(request._id, "accept")
                }
              >
                {isProcessing ? "Processing..." : "Accept"}
              </Button>

              <Button
                type="button"
                variant="destructive"
                disabled={processingRequestId !== null}
                onClick={() =>
                  handleRequestAction(request._id, "reject")
                }
              >
                {isProcessing ? "Processing..." : "Reject"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <p className="text-muted-foreground">
          Loading exchange requests...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Exchange Requests
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage the skill exchange requests you send and receive.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-md border border-green-600/30 bg-green-600/5 p-3 text-sm text-green-700"
        >
          {success}
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Received Requests</h2>
          <Badge variant="outline">{receivedRequests.length}</Badge>
        </div>

        {receivedRequests.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              You haven't received any exchange requests yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {receivedRequests.map((request) => (
              <RequestCard
                key={request._id}
                request={request}
                type="received"
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Sent Requests</h2>
          <Badge variant="outline">{sentRequests.length}</Badge>
        </div>

        {sentRequests.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              You haven't sent any exchange requests yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {sentRequests.map((request) => (
              <RequestCard
                key={request._id}
                request={request}
                type="sent"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default ExchangeRequests;