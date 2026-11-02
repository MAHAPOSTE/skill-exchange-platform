
import { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  Sparkles,
  BookOpen,
  Repeat,
  CalendarClock,
  AlertCircle,
} from "lucide-react";
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
        setError(
          err.response?.data?.message || "Failed to load statistics"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const cards = [
    { title: "Total Users", value: stats.users, icon: Users, tone: "navy" },
    { title: "Total Mentors", value: stats.mentors, icon: UserCheck, tone: "sky" },
    { title: "Total Skills", value: stats.skills, icon: Sparkles, tone: "sky" },
    { title: "Total Communities", value: stats.communities, icon: BookOpen, tone: "navy" },
    { title: "Exchange Requests", value: stats.exchangeRequests, icon: Repeat, tone: "sky" },
    { title: "Sessions", value: stats.sessions, icon: CalendarClock, tone: "green" },
    {
      title: "Pending Mentor Requests",
      value: stats.pendingMentorRequests,
      icon: UserCheck,
      tone: "sky",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-9 w-48 rounded-lg bg-[#DCE4EF]" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-2xl bg-[#DCE4EF]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-[#DCE4EF] bg-white p-8 text-center">
        <AlertCircle className="size-10 text-[#4F86F7]" />
        <h2 className="mt-3 font-semibold text-[#142D4E]">
          Unable to load statistics
        </h2>
        <p className="mt-1 text-sm text-[#142D4E]/65">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-full space-y-8 bg-[#F3F6FA] pb-6">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-[#142D4E] sm:text-3xl">
          Platform Statistics
        </h1>
        <p className="mt-2 text-sm text-[#142D4E]/65">
          Overview of users, skills, communities and platform activity.
        </p>
      </section>

      <section>
        <div className="mb-5">
          <h2 className="text-lg font-bold text-[#142D4E]">
            Platform Overview
          </h2>
          <p className="mt-1 text-sm text-[#142D4E]/65">
            Current totals retrieved from your platform database.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-4">
          {cards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>
      </section>

      <section className="flex items-center gap-4 rounded-2xl border border-[#DCE4EF] bg-white p-5 sm:p-6">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#16A34A]/10 text-[#16A34A]">
          <CalendarClock className="size-6" />
        </div>

        <div>
          <h3 className="font-semibold text-[#142D4E]">
            Platform Activity
          </h3>
          <p className="mt-1 text-sm text-[#142D4E]/65">
            Your platform currently has {stats.sessions} sessions and{" "}
            {stats.exchangeRequests} exchange requests.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Statistics;
