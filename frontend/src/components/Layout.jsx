import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu, Sparkles } from "lucide-react";
import api from "../api";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

function Layout() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await api.get("/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data.profile);
      } catch (error) {
        console.error("Failed to load user profile:", error);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchProfile();
  }, []);

  // Close the mobile drawer on route change and on Escape
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  if (loadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F6FA]">
  <div className="size-10 animate-spin rounded-full border-4 border-[#DCE4EF] border-t-[#4F86F7]" />
</div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F6FA] text-[#142D4E]">
      <Sidebar
        user={user}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onLogout={handleLogout}
      />

      <div className="flex min-h-screen flex-col lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-[#DCE4EF] bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              className="rounded-lg p-2 text-[#142D4E] transition hover:bg-[#EAF1FB] lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
            <h2 className="text-base font-semibold text-[#142D4E] sm:text-lg">
              Skill Exchange Platform
            </h2>
          </div>

          <Link
            to="/profile"
            className="rounded-lg border border-[#DCE4EF] bg-white px-3.5 py-1.5 text-sm font-medium text-[#142D4E] transition hover:border-[#4F86F7] hover:text-[#4F86F7]"
          >
            Profile
          </Link>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <Outlet context={{ user }} />
        </main>

        <Footer />
      </div>

      <Link
        to="/ai-assistant"
        className="fixed bottom-6 right-4 z-30 flex items-center gap-2 rounded-full bg-[#4F86F7] p-3.5 text-sm font-semibold text-white shadow-lg shadow-[#142D4E]/20 transition hover:scale-105 hover:bg-[#3B72E8] sm:right-6 sm:px-5 sm:py-3"
        aria-label="AI Assistant"
      >
        <Sparkles className="size-5" />
        <span className="hidden sm:inline">AI Assistant</span>
      </Link>
    </div>
  );
}

export default Layout;
