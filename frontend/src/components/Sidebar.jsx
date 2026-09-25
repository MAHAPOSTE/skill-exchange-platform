import { Link } from "react-router-dom";

function Sidebar({ role }) {
  return (
    <aside className="sidebar">
      <h2>Skill Exchange</h2>

      <nav>
        <Link to="/dashboard">Dashboard</Link>

        {role === "user" && (
          <>
            <Link to="/skills">Skills</Link>
            <Link to="/communities">Communities</Link>
            <Link to="/skill-exchange">Exchange Requests</Link>
            <Link to="/sessions">Sessions</Link>
          </>
        )}

        {role === "mentor" && (
          <>
            <Link to="/profile">Profile</Link>
            <Link to="/skills">Skills</Link>
            <Link to="/communities">Communities</Link>
            <Link to="/skill-exchange">Exchange Requests</Link>
            <Link to="/sessions">Sessions</Link>
          </>
        )}

        {role === "admin" && (
          <>
            <Link to="/users">Users</Link>
            <Link to="/mentor-requests">Mentor Requests</Link>
            <Link to="/communities">Communities</Link>
            <Link to="/statistics">Statistics</Link>
          </>
        )}
      </nav>
    </aside>
  );
}

export default Sidebar;