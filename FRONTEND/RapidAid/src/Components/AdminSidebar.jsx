import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Landing", to: "/admin" },
  { label: "Incidents", to: "/admin/incidents" },
  { label: "Volunteers", to: "/admin/volunteers" },
  { label: "Donations", to: "/admin/donations" },
  { label: "Users", to: "/admin/users" },
];

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-slate-950 text-white min-h-screen px-5 py-6">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          RapidAid
        </p>
        <h2 className="text-lg font-semibold mt-1">Admin Console</h2>
      </div>

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/admin"}
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-white text-slate-900"
                  : "text-slate-300 hover:bg-slate-800"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
