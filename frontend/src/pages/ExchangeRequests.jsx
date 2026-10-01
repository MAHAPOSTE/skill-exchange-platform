import { useEffect, useState } from "react";
import api from "../api";

function ExchangeRequests() {
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [receivedResponse, sentResponse] = await Promise.all([
        api.get("/api/skill-exchange-requests/received", {
          headers,
        }),
        api.get("/api/skill-exchange-requests/sent", {
          headers,
        }),
      ]);

      setReceivedRequests(receivedResponse.data.requests);
      setSentRequests(sentResponse.data.requests);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load exchange requests"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/api/skill-exchange-requests/${id}/accept`,
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
          "Failed to accept exchange request"
      );
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/api/skill-exchange-requests/${id}/reject`,
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
          "Failed to reject exchange request"
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

      <div className="requests-section">
        <h2>Received Requests</h2>

        {receivedRequests.length === 0 ? (
          <p>No received requests.</p>
        ) : (
          receivedRequests.map((request) => (
            <div
              className="request-card"
              key={request._id}
            >
              <h3>
                From: {request.sender?.name}
              </h3>

              <p>
                Email: {request.sender?.email}
              </p>

              <p>
                Requested Skill:{" "}
                {request.requestedSkill?.name}
              </p>

              <p>
                Requested Skill Type:{" "}
                {request.requestedSkill?.type}
              </p>

              {request.offeredSkill && (
                <p>
                  Offered Skill:{" "}
                  {request.offeredSkill?.name}
                </p>
              )}

              {request.message && (
                <p>
                  Message: {request.message}
                </p>
              )}

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
      </div>

      <div className="requests-section">
        <h2>Sent Requests</h2>

        {sentRequests.length === 0 ? (
          <p>No sent requests.</p>
        ) : (
          sentRequests.map((request) => (
            <div
              className="request-card"
              key={request._id}
            >
              <h3>
                To: {request.receiver?.name}
              </h3>

              <p>
                Email: {request.receiver?.email}
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

              {request.message && (
                <p>
                  Message: {request.message}
                </p>
              )}

              <p>
                Status: {request.status}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ExchangeRequests;