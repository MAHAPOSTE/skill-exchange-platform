import { useEffect, useState } from "react";
import { Users, UserCheck, Sparkles, BookOpen, Repeat, CalendarClock, AlertCircle } from "lucide-react";
import api from "../api";
import StatCard from "../components/StatCard";

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
          headers: { Authorization: `Bearer ${token}` },
        });

        setStats(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <div className="grid animate-pulse grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-slate-200" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <AlertCircle className="size-10 text-red-500" />
        <p className="mt-3 text-sm text-red-700">{error}</p>
      </div>
    );
  }

  const cards = [
    { title: "Total Users", value: stats.users, icon: Users, tone: "indigo" },
    { title: "Total Mentors", value: stats.mentors, icon: UserCheck, tone: "violet" },
    { title: "Total Skills", value: stats.skills, icon: Sparkles, tone: "sky" },
    { title: "Total Communities", value: stats.communities, icon: BookOpen, tone: "emerald" },
    { title: "Exchange Requests", value: stats.exchangeRequests, icon: Repeat, tone: "amber" },
    { title: "Sessions", value: stats.sessions, icon: CalendarClock, tone: "rose" },
    { title: "Pending Mentor Requests", value: stats.pendingMentorRequests, icon: UserCheck, tone: "amber" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Statistics</h1>
        <p className="mt-1 text-sm text-slate-500">Platform overview and statistics</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5 xl:grid-cols-4">
        {cards.map((c) => (
          <StatCard key={c.title} {...c} />
        ))}
      </div>
    </div>
  );
}

export default Statistics;
