import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>Skill Exchange</h2>

      <nav>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/skills">Skills</Link>
        <Link to="/communities">Communities</Link>
       <Link to="/skill-exchange">Exchange Requests</Link>
        <Link to="/sessions">Sessions</Link>
      </nav>
    </aside>
  );
}

export default Sidebar;