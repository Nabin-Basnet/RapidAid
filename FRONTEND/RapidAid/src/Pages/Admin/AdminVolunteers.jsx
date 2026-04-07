import { useEffect, useState } from "react";
import axiosInstance from "../../api/Axios";
import { formatDate, parseList } from "./adminUtils";

const VOLUNTEER_STATUSES = [
  { label: "Approve", value: "approved" },
  { label: "Suspend", value: "suspended" },
  { label: "Reject", value: "rejected" },
  { label: "Complete", value: "completed" },
];

const getAvailableActions = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "completed") {
    return [];
  }
  if (normalized === "suspended") {
    return [];
  }
  if (normalized === "pending") {
    return VOLUNTEER_STATUSES.filter((item) =>
      ["approved", "rejected"].includes(item.value)
    );
  }
  if (normalized === "approved") {
    return VOLUNTEER_STATUSES.filter((item) =>
      ["suspended", "rejected", "completed"].includes(item.value)
    );
  }
  if (normalized === "rejected") {
    return VOLUNTEER_STATUSES.filter((item) => item.value === "approved");
  }
  return VOLUNTEER_STATUSES;
};

export default function AdminVolunteers() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [actionState, setActionState] = useState({});

  const refreshData = async () => {
    try {
      setError("");
      const res = await axiosInstance.get("volunteer/list/");
      setAssignments(parseList(res.data));
    } catch (err) { setError(err?.response?.data?.detail || "Failed to load volunteers."); }
    finally { setLoading(false); }
  };

  useEffect(() => { refreshData(); }, []);

  const handleVolunteerStatus = async (assignmentId, status) => {
    const key = `volunteer-${assignmentId}`;
    try {
      setActionState((prev) => ({ ...prev, [key]: true }));
      await axiosInstance.patch(`volunteer/update/${assignmentId}/`, { status });
      await refreshData();
    } catch (err) { setError(err?.response?.data?.detail || "Could not update volunteer status."); }
    finally { setActionState((prev) => ({ ...prev, [key]: false })); }
  };

  if (loading) return <div className="rounded-3xl border border-[#d4e2eb] bg-white p-8 text-sm text-[var(--text-soft)]">Loading volunteers...</div>;

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-[#d4e2eb] bg-white p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-soft)]">Volunteers</p>
        <h1 className="mt-2 text-3xl font-extrabold text-[var(--text)]">Volunteer Applications</h1>
      </section>
      {error && <p className="rounded-xl bg-[#fff1f1] px-3 py-2 text-sm text-[#b42318]">{error}</p>}

      <section className="rounded-3xl border border-[#d4e2eb] bg-white">
        {assignments.length === 0 && <p className="px-5 py-6 text-sm text-[var(--text-soft)]">No volunteer applications available.</p>}
        {assignments.map((assignment) => {
          const loadingKey = `volunteer-${assignment.id}`;
          const availableActions = getAvailableActions(assignment.status);
          return (
            <article key={assignment.id} className="border-b border-[#ecf2f7] px-5 py-4 last:border-b-0">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-lg font-semibold text-[var(--text)]">{assignment.user_name || "Volunteer"} for {assignment.incident_title || "Unknown incident"}</p>
                  <p className="text-sm text-[var(--text-soft)]">Status: {assignment.status}</p>
                  <p className="text-xs text-[var(--text-soft)]">Applied: {formatDate(assignment.applied_at)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableActions.map((item) => (
                    <button key={item.value} onClick={() => handleVolunteerStatus(assignment.id, item.value)} disabled={!!actionState[loadingKey]} className="rounded-xl bg-[var(--brand)] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
