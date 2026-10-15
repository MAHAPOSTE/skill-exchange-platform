import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Sparkles,
  Users,
  Repeat,
  CalendarClock,
  BarChart3,
  UserCheck,
  X,
  LogOut,
} from "lucide-react";

const learnerLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/skills", label: "Skills", icon: Sparkles },
  { to: "/communities", label: "Communities", icon: Users },
  { to: "/skill-exchange", label: "Exchange Requests", icon: Repeat },
  { to: "/sessions", label: "Sessions", icon: CalendarClock },
];

const adminLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/users", label: "Users", icon: Users },
  { to: "/mentor-requests", label: "Mentor Requests", icon: UserCheck },
  { to: "/communities", label: "Communities", icon: Users },
  { to: "/sessions", label: "Sessions", icon: CalendarClock },
  { to: "/statistics", label: "Statistics", icon: BarChart3 },
];

export function getNavLinks(role) {
  return role === "admin" ? adminLinks : learnerLinks;
}

function Sidebar({ user, open, onClose, onLogout }) {
  const links = getNavLinks(user?.role);
  const initials = (user?.name || "U")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-out lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Sidebar"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
              <Repeat className="size-5" />
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Skill Exchange
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Menu
          </p>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to + label}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <Icon className="size-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="shrink-0 border-t border-slate-100 p-3">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user?.name || "User"}
              </p>
              <p className="truncate text-xs capitalize text-slate-500">
                {user?.role || "learner"}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-red-600"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
