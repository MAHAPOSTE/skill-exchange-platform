import { Link, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

function Layout() {
  return (
    <div className="app-layout">

      <Sidebar />

      <div className="app-main">

        <header className="app-header">
          <h2>Skill Exchange Platform</h2>

          <Link to="/profile">Profile</Link>
        </header>

        <main className="content-container">
          <Outlet />
        </main>

        <Footer />

      </div>

      <button className="ai-floating">
        <span className="ai-logo">✦</span>
        <span>AI Assistant</span>
      </button>

    </div>
  );
}

export default Layout;