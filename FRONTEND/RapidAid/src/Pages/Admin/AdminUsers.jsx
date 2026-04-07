import { useEffect, useState } from "react";
import axiosInstance from "../../api/Axios";
import { formatDate, parseList } from "./adminUtils";

const ROLE_OPTIONS = [
  { value: "citizen", label: "Citizen" },
  { value: "admin", label: "Admin" },
  { value: "rescue_team", label: "Rescue Team" },
  { value: "assessment_team", label: "Assessment Team" },
];

export default function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [actionState, setActionState] = useState({});

  const refreshData = async () => {
    try {
      setError("");
      const res = await axiosInstance.get("auth/admin/users/");
      setUsers(parseList(res.data));
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshData(); }, []);

  const updateUser = async (userId, payload) => {
    const key = `user-${userId}`;
    try {
      setActionState((prev) => ({ ...prev, [key]: true }));
      setError("");
      await axiosInstance.patch(`auth/admin/users/${userId}/`, payload);
      await refreshData();
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not update user.");
    } finally {
      setActionState((prev) => ({ ...prev, [key]: false }));
    }
  };

  if (loading) return <div className="rounded-3xl border border-[#d4e2eb] bg-white p-8 text-sm text-[var(--text-soft)]">Loading users...</div>;

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-[#d4e2eb] bg-white p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-soft)]">Users</p>
        <h1 className="mt-2 text-3xl font-extrabold text-[var(--text)]">User Directory</h1>
      </section>
      {error && <p className="rounded-xl bg-[#fff1f1] px-3 py-2 text-sm text-[#b42318]">{error}</p>}

      <section className="rounded-3xl border border-[#d4e2eb] bg-white">
        {users.length === 0 && <p className="px-5 py-6 text-sm text-[var(--text-soft)]">No users available.</p>}
        {users.map((user) => (
          <article key={user.id} className="border-b border-[#ecf2f7] px-5 py-4 last:border-b-0">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-lg font-semibold text-[var(--text)]">{user.full_name || "Unknown User"}</p>
                <p className="text-sm text-[var(--text-soft)]">{user.email}</p>
                <p className="text-xs text-[var(--text-soft)]">Joined: {formatDate(user.date_joined)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={user.role}
                  disabled={!!actionState[`user-${user.id}`]}
                  onChange={(e) => updateUser(user.id, { role: e.target.value })}
                  className="rounded-xl border border-[#cfdee8] px-3 py-2 text-xs font-semibold text-[var(--text)]"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => updateUser(user.id, { is_active: !user.is_active })}
                  disabled={!!actionState[`user-${user.id}`]}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold text-white disabled:opacity-60 ${user.is_active ? "bg-[#b42318]" : "bg-[#0f7a5e]"}`}
                >
                  {user.is_active ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
