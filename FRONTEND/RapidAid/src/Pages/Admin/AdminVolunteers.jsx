import { useEffect, useState } from "react";
import axiosInstance from "../../api/Axios";
import { formatDate, parseList } from "./adminUtils";

const STATUS_ACTIONS = {
  pending: [
    { label: "Approve", value: "approved", className: "bg-[#0f7a5e]" },
    { label: "Reject", value: "rejected", className: "bg-[#b42318]" },
  ],
  approved: [
    { label: "Complete", value: "completed", className: "bg-[#0f7a5e]" },
    { label: "Suspend", value: "suspended", className: "bg-[#8a5a00]" },
    { label: "Reject", value: "rejected", className: "bg-[#b42318]" },
  ],
  suspended: [
    { label: "Re-approve", value: "approved", className: "bg-[#0f7a5e]" },
    { label: "Reject", value: "rejected", className: "bg-[#b42318]" },
  ],
  rejected: [
    { label: "Approve", value: "approved", className: "bg-[#0f7a5e]" },
  ],
  completed: [],
};

const STATUS_STYLES = {
  pending: "bg-[#fff7e6] text-[#8a5a00]",
  approved: "bg-[#ecfdf3] text-[#0f7a5e]",
  suspended: "bg-[#fff7e6] text-[#8a5a00]",
  rejected: "bg-[#fff1f1] text-[#b42318]",
  completed: "bg-[#eff6ff] text-[#1d4ed8]",
};

export default function AdminVolunteers() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [volunteers, setVolunteers] = useState([]);
  const [actionState, setActionState] = useState({});

  const refreshData = async () => {
    try {
      setError("");
      const res = await axiosInstance.get("volunteer/list/");
      setVolunteers(parseList(res.data));
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load volunteer assignments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const updateVolunteerStatus = async (assignmentId, status) => {
    const key = `volunteer-${assignmentId}`;
    try {
      setActionState((prev) => ({ ...prev, [key]: true }));
      setError("");
      await axiosInstance.patch(`volunteer/update/${assignmentId}/`, { status });
      await refreshData();
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not update volunteer status.");
    } finally {
      setActionState((prev) => ({ ...prev, [key]: false }));
    }
  };

  if (loading) {
    return <div className="rounded-3xl border border-[#d4e2eb] bg-white p-8 text-sm text-[var(--text-soft)]">Loading volunteers...</div>;
  }

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-[#d4e2eb] bg-white p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-soft)]">Volunteers</p>
        <h1 className="mt-2 text-3xl font-extrabold text-[var(--text)]">Volunteer Assignments</h1>
      </section>

      {error && <p className="rounded-xl bg-[#fff1f1] px-3 py-2 text-sm text-[#b42318]">{error}</p>}

      <section className="rounded-3xl border border-[#d4e2eb] bg-white">
        {volunteers.length === 0 && <p className="px-5 py-6 text-sm text-[var(--text-soft)]">No volunteer assignments available.</p>}
        {volunteers.map((assignment) => {
          const loadingKey = `volunteer-${assignment.id}`;
          const actions = STATUS_ACTIONS[assignment.status] || [];
          return (
            <article key={assignment.id} className="border-b border-[#ecf2f7] px-5 py-4 last:border-b-0">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-semibold text-[var(--text)]">{assignment.user_name || "Unknown Volunteer"}</p>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[assignment.status] || "bg-slate-100 text-slate-700"}`}>
                      {assignment.status}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-soft)]">{assignment.user_email || "No email available"}</p>
                  <p className="text-sm text-[var(--text-soft)]">Incident: {assignment.incident_title || `Incident #${assignment.incident}`}</p>
                  <p className="text-xs text-[var(--text-soft)]">
                    Applied: {formatDate(assignment.applied_at)} | Approved: {formatDate(assignment.approved_at)} | Completed: {formatDate(assignment.completed_at)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {actions.length === 0 ? (
                    <span className="rounded-xl bg-[#f3f7fa] px-3 py-2 text-xs font-semibold text-[var(--text-soft)]">No actions available</span>
                  ) : (
                    actions.map((action) => (
                      <button
                        key={action.value}
                        onClick={() => updateVolunteerStatus(assignment.id, action.value)}
                        disabled={!!actionState[loadingKey]}
                        className={`rounded-xl px-3 py-2 text-xs font-semibold text-white disabled:opacity-50 ${action.className}`}
                      >
                        {action.label}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
