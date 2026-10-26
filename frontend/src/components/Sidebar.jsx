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
        className={`fixed inset-0 z-40 bg-[#0B1730]/60 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#142D4E] text-white shadow-xl transition-transform duration-200 ease-out lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Sidebar"
      >
        {/* Brand */}
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#4F86F7] text-white shadow-lg shadow-black/15">
              <Repeat className="size-5" />
            </span>
            <div>
              <p className="text-lg font-bold tracking-tight text-white">
                Skill Exchange
              </p>
              <p className="text-xs text-blue-200">
                Learn. Share. Grow.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-blue-100 transition hover:bg-white/10 lg:hidden"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
          <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-[0.16em] text-blue-200/70">
            Main Menu
          </p>

          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to + label}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#4F86F7] text-white shadow-md shadow-black/10"
                    : "text-blue-100/80 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="size-5 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Learning prompt */}
        <div className="mx-4 mb-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
          <div className="mb-2 flex items-center gap-2 text-[#9DBBFF]">
            <Sparkles className="size-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Keep growing
            </span>
          </div>
          <p className="text-sm leading-5 text-white">
            Every skill you share creates a new opportunity to learn.
          </p>
        </div>

        {/* User profile and logout */}
        <div className="shrink-0 border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/[0.06]">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-[#29466B] text-sm font-bold text-white">
              {initials}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {user?.name || "User"}
              </p>
              <p className="truncate text-xs capitalize text-blue-200">
                {user?.role || "learner"}
              </p>
            </div>

            <button
              onClick={onLogout}
              className="rounded-lg p-2 text-blue-100 transition hover:bg-red-500/20 hover:text-red-300"
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
