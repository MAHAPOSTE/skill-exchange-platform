import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

function Dashboard() {
  const navigate = useNavigate();

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
        console.log(error.response?.data);
        setError(
          error.response?.data?.message || "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return <h2>Loading dashboard...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <div className="dashboard">

      <header className="dashboard-header">
        <h2>Skill Exchange Platform</h2>

        <button onClick={handleLogout}>Logout</button>
      </header>

      <nav className="dashboard-nav">
        <Link to="/profile">Profile</Link>
        <Link to="/skills">Skills</Link>
        <Link to="/mentor-requests">Mentor Requests</Link>
        <Link to="/communities">Communities</Link>
        <Link to="/skill-exchange">Skill Exchange</Link>
        <Link to="/sessions">Sessions</Link>
        <Link to="/ai-assistant">AI Assistant</Link>
      </nav>

      <main className="dashboard-content">

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

      </main>

    </div>
  );
}

export default Dashboard;