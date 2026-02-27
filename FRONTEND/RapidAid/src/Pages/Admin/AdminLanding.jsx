import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
import axiosInstance from "../../api/Axios";
import { parseList } from "./adminUtils";

export default function AdminLanding() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [incidents, setIncidents] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const refreshData = async () => {
      try {
        setError("");
        const [incidentRes, volunteerRes, donationRes, usersRes] = await Promise.all([
          axiosInstance.get("incidents/"),
          axiosInstance.get("volunteer/list/"),
          axiosInstance.get("donations/list/"),
          axiosInstance.get("auth/admin/users/"),
        ]);

        setIncidents(parseList(incidentRes.data));
        setVolunteers(parseList(volunteerRes.data));
        setDonations(parseList(donationRes.data));
        setUsers(parseList(usersRes.data));
      } catch (err) {
        setError(err?.response?.data?.detail || "Failed to load admin dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    refreshData();
  }, []);

  const stats = useMemo(() => ({
    users: users.length,
    incidents: incidents.length,
    donations: donations.length,
    pendingVolunteers: volunteers.filter((v) => v.status === "pending").length,
    pendingIncidents: incidents.filter((i) => i.status === "reported").length,
  }), [users, incidents, donations, volunteers]);

  const cards = [
    { label: "Incidents", to: "/admin/incidents", desc: "Moderate reports and update status.", meta: `Pending: ${stats.pendingIncidents}` },
    { label: "Volunteers", to: "/admin/volunteers", desc: "Approve, reject, and complete applications.", meta: `Pending: ${stats.pendingVolunteers}` },
    { label: "Donations", to: "/admin/donations", desc: "Review donation activity and accountability.", meta: `Total: ${stats.donations}` },
    { label: "Users", to: "/admin/users", desc: "Manage all registered accounts.", meta: `Total: ${stats.users}` },
    { label: "Create User", to: "/admin/create-user", desc: "Provision role-based platform users.", meta: "Admin / Rescue / Assessment" },
    { label: "Rescue Ops", to: "/admin/rescue", desc: "Coordinate teams and assignments.", meta: "Operational flow" },
    { label: "Assessments", to: "/admin/assessments", desc: "Capture family and loss records.", meta: "Impact records" },
    { label: "Ledger", to: "/admin/ledger", desc: "Review audit trail entries.", meta: "Traceability" },
  ];

  if (loading) return <div className="rounded-3xl border border-[#d4e2eb] bg-white p-8 text-sm text-[var(--text-soft)]">Loading admin dashboard...</div>;

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-[#cddde7] bg-[#0f2a3f] p-7 text-white md:p-9">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]"><LayoutDashboard size={14} />Control Panel</p>
        <h1 className="mt-4 text-4xl font-extrabold">Admin Landing</h1>
        <Link to="/" className="mt-4 inline-block text-sm font-semibold text-[#8be2d2]">Back to Site</Link>
      </section>

      {error && <p className="rounded-xl bg-[#fff1f1] px-3 py-2 text-sm text-[#b42318]">{error}</p>}

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-[#d4e2eb] bg-white p-4"><p className="text-xs text-[var(--text-soft)]">Users</p><p className="text-2xl font-bold">{stats.users}</p></div>
        <div className="rounded-2xl border border-[#d4e2eb] bg-white p-4"><p className="text-xs text-[var(--text-soft)]">Incidents</p><p className="text-2xl font-bold">{stats.incidents}</p></div>
        <div className="rounded-2xl border border-[#d4e2eb] bg-white p-4"><p className="text-xs text-[var(--text-soft)]">Donations</p><p className="text-2xl font-bold">{stats.donations}</p></div>
        <div className="rounded-2xl border border-[#d4e2eb] bg-white p-4"><p className="text-xs text-[var(--text-soft)]">Pending Volunteers</p><p className="text-2xl font-bold">{stats.pendingVolunteers}</p></div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <Link key={card.to} to={card.to} className="rounded-3xl border border-[#d4e2eb] bg-white p-5 transition hover:border-[var(--brand)]">
            <p className="text-xs uppercase tracking-wide text-[var(--text-soft)]">{card.label}</p>
            <p className="mt-2 text-lg font-bold text-[var(--text)]">{card.desc}</p>
            <p className="mt-2 text-sm text-[var(--text-soft)]">{card.meta}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
