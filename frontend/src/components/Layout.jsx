import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import api from "../api";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

function Layout() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);  

  useEffect(() => {
    const fetchProfile = async () => {
      try {
  const token = localStorage.getItem("token");

  const response = await api.get("/api/users/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log("Profile response:", response.data);
   setUser(response.data.profile);
}  catch (error) {
  console.error("Failed to load user profile:", error);
  console.error("Response:", error.response?.data);
}
 finally {
  setLoadingUser(false);
}
    };

    fetchProfile();
  }, []);
  if (loadingUser) {
  return <p>Loading...</p>;
}

  return (
    <div className="app-layout">

      <Sidebar role={user?.role} />

      <div className="app-main">

        <header className="app-header">
          <h2>Skill Exchange Platform</h2>

          <Link to="/profile">Profile</Link>
        </header>

        <main className="content-container">
          <Outlet context={{ user }} />
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