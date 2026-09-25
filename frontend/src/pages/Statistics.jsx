import { useEffect, useState } from "react";
import api from "../api";

function Statistics() {
  const [stats, setStats] = useState({
    users: 0,
    mentors: 0,
    skills: 0,
    communities: 0,
    exchangeRequests: 0,
    sessions: 0,
    pendingMentorRequests: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await api.get("/api/dashboard/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStats(response.data);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to load statistics"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
    return <h2>Loading statistics...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <div className="dashboard-content">
      <h1>Statistics</h1>

      <p>Platform overview and statistics</p>

      <div className="stats-grid">

        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{stats.users}</p>
        </div>

        <div className="stat-card">
          <h3>Total Mentors</h3>
          <p>{stats.mentors}</p>
        </div>

        <div className="stat-card">
          <h3>Total Skills</h3>
          <p>{stats.skills}</p>
        </div>

        <div className="stat-card">
          <h3>Total Communities</h3>
          <p>{stats.communities}</p>
        </div>

        <div className="stat-card">
          <h3>Exchange Requests</h3>
          <p>{stats.exchangeRequests}</p>
        </div>

        <div className="stat-card">
          <h3>Sessions</h3>
          <p>{stats.sessions}</p>
        </div>

        <div className="stat-card">
          <h3>Pending Mentor Requests</h3>
          <p>{stats.pendingMentorRequests}</p>
        </div>

      </div>
    </div>
  );
}

export default Statistics;