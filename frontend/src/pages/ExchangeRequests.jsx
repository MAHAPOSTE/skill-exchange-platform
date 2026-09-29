import { useEffect, useState } from "react";
import api from "../api";

function ExchangeRequests() {
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const [sentResponse, receivedResponse] = await Promise.all([
        api.get("/api/skill-exchange-requests/sent", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        api.get("/api/skill-exchange-requests/received", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      setSentRequests(sentResponse.data.requests || []);
      setReceivedRequests(receivedResponse.data.requests || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to fetch exchange requests"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (requestId) => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/api/skill-exchange-requests/${requestId}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchRequests();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to accept request"
      );
    }
  };

  const handleReject = async (requestId) => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/api/skill-exchange-requests/${requestId}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchRequests();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to reject request"
      );
    }
  };

  if (loading) {
    return <h2>Loading exchange requests...</h2>;
  }

  return (
    <div className="exchange-requests-page">
      <h1>Exchange Requests</h1>
      <p>Manage your skill exchange requests.</p>

      {error && <p>{error}</p>}

      <section>
        <h2>Received Requests</h2>

        {receivedRequests.length === 0 ? (
          <p>No received requests.</p>
        ) : (
          receivedRequests.map((request) => (
            <div
              className="exchange-request-card"
              key={request._id}
            >
              <h3>
                {request.sender?.name || "Unknown User"}
              </h3>

              <p>
                Skill:{" "}
                {request.skill?.name || "Unknown Skill"}
              </p>

              <p>
                Status: {request.status}
              </p>

              {request.status === "pending" && (
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      handleAccept(request._id)
                    }
                  >
                    Accept
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleReject(request._id)
                    }
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </section>

      <section>
        <h2>Sent Requests</h2>

        {sentRequests.length === 0 ? (
          <p>No sent requests.</p>
        ) : (
          sentRequests.map((request) => (
            <div
              className="exchange-request-card"
              key={request._id}
            >
              <h3>
                {request.receiver?.name || "Unknown User"}
              </h3>

              <p>
                Skill:{" "}
                {request.skill?.name || "Unknown Skill"}
              </p>

              <p>
                Status: {request.status}
              </p>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default ExchangeRequests;