import { NavLink } from "react-router-dom";
import { LayoutDashboard, AlertTriangle, Users, HandCoins, UserPlus, LifeBuoy, ClipboardList, FileClock } from "lucide-react";

const navItems = [
  { label: "Landing", to: "/admin", icon: LayoutDashboard },
  { label: "Incidents", to: "/admin/incidents", icon: AlertTriangle },
  { label: "Volunteers", to: "/admin/volunteers", icon: Users },
  { label: "Donations", to: "/admin/donations", icon: HandCoins },
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Create User", to: "/admin/create-user", icon: UserPlus },
  { label: "Rescue Ops", to: "/admin/rescue", icon: LifeBuoy },
  { label: "Assessments", to: "/admin/assessments", icon: ClipboardList },
  { label: "Ledger", to: "/admin/ledger", icon: FileClock },
];

export default function AdminSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-72 border-r border-[#d5e2ea] bg-[#f6fbff] px-5 py-6 md:block">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-soft)]">
          RapidAid
        </p>
        <h2 className="mt-1 text-lg font-semibold text-[var(--text)]">Admin Console</h2>
      </div>

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/admin"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? "bg-[var(--brand)] text-white shadow-md"
                  : "text-[var(--text-soft)] hover:bg-white hover:text-[var(--text)]"
              }`
            }
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
