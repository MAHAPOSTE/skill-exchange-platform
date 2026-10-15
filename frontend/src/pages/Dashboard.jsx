import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  Sparkles,
  Users,
  Repeat,
  CalendarClock,
  UserCheck,
  BookOpen,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import api from "../api";
import StatCard from "../components/StatCard";

const learnerCards = (s) => [
  { title: "My Skills", value: s.skills, icon: Sparkles, tone: "indigo", description: "Skills to teach or learn" },
  { title: "Communities", value: s.communities, icon: Users, tone: "violet", description: "Groups you can join" },
  { title: "Exchange Requests", value: s.exchangeRequests, icon: Repeat, tone: "amber", description: "Requests to review" },
  { title: "Sessions", value: s.sessions, icon: CalendarClock, tone: "emerald", description: "Learning sessions" },
];

const adminCards = (s) => [
  { title: "Total Users", value: s.users, icon: Users, tone: "indigo" },
  { title: "Mentors", value: s.mentors, icon: UserCheck, tone: "violet" },
  { title: "Total Skills", value: s.skills, icon: Sparkles, tone: "sky" },
  { title: "Communities", value: s.communities, icon: BookOpen, tone: "emerald" },
  { title: "Exchange Requests", value: s.exchangeRequests, icon: Repeat, tone: "amber" },
  { title: "Sessions", value: s.sessions, icon: CalendarClock, tone: "rose" },
  { title: "Pending Mentor Requests", value: s.pendingMentorRequests, icon: UserCheck, tone: "amber" },
];

const learnerActions = [
  { title: "Explore Skills", description: "Find skills you want to learn.", to: "/skills", icon: Sparkles },
  { title: "View Sessions", description: "Check your learning sessions.", to: "/sessions", icon: CalendarClock },
  { title: "Explore Communities", description: "Connect with other learners.", to: "/communities", icon: Users },
];

const adminActions = [
  { title: "Manage Users", description: "Review and manage accounts.", to: "/users", icon: Users },
  { title: "Mentor Requests", description: "Approve or reject applications.", to: "/mentor-requests", icon: UserCheck },
  { title: "View Statistics", description: "Platform-wide overview.", to: "/statistics", icon: BookOpen },
];

function Skeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-36 rounded-3xl bg-slate-200" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-36 rounded-2xl bg-slate-200" />
        ))}
      </div>
    </div>
  );
}

function Dashboard() {
  const { user } = useOutletContext();

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
          headers: { Authorization: `Bearer ${token}` },
        });

        setStats(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (!user || loading) return <Skeleton />;

  if (error) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <AlertCircle className="size-10 text-red-500" />
        <h2 className="mt-3 text-lg font-semibold text-red-800">Something went wrong</h2>
        <p className="mt-1 text-sm text-red-700">{error}</p>
      </div>
    );
  }

  const isAdmin = user.role === "admin";
  const cards = isAdmin ? adminCards(stats) : learnerCards(stats);
  const actions = isAdmin ? adminActions : learnerActions;
  const roleLabel = isAdmin ? "Admin" : user.role === "mentor" ? "Mentor" : "Learner";

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 p-6 text-white shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 right-24 size-40 rounded-full bg-white/10" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              {roleLabel} Dashboard
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back, {user.name}
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-indigo-100 sm:text-base">
              {isAdmin
                ? "Here's what's happening across the platform today."
                : "Manage your learning journey in one place."}
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-slate-900">Overview</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5 xl:grid-cols-4">
          {cards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
          <p className="mt-0.5 text-sm text-slate-500">Jump straight into what matters.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 lg:gap-5">
          {actions.map(({ title, description, to, icon: Icon }) => (
            <Link
              key={title}
              to={to}
              className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                <Icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-900">{title}</h3>
                <p className="mt-1 text-sm text-slate-500">{description}</p>
              </div>
              <ArrowRight className="mt-1 size-5 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-600" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
