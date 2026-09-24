import { useEffect, useState } from "react";
import api from "../api";

function Dashboard() {
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
    const fetchDashboardStats = async () => {
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
          error.response?.data?.message || "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return <h2>Loading dashboard...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <div className="dashboard-content">

      <h1>Dashboard</h1>

      <p>Welcome to Skill Exchange Platform</p>

      <div className="stats-grid">

        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{stats.users}</p>
        </div>

        <div className="stat-card">
          <h3>Mentors</h3>
          <p>{stats.mentors}</p>
        </div>

        <div className="stat-card">
          <h3>Skills</h3>
          <p>{stats.skills}</p>
        </div>

        <div className="stat-card">
          <h3>Communities</h3>
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

export default Dashboard;