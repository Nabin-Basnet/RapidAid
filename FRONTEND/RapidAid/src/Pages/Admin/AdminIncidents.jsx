import { useEffect, useState } from "react";
import axiosInstance from "../../api/Axios";
import { formatDate, parseList } from "./adminUtils";

const INCIDENT_STATUSES = [
  { label: "Verify", value: "verified" },
  { label: "Reject", value: "rejected" },
  { label: "In Rescue", value: "in_rescue" },
  { label: "Resolve", value: "resolved" },
];

export default function AdminIncidents() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [incidents, setIncidents] = useState([]);
  const [actionState, setActionState] = useState({});

  const refreshData = async () => {
    try {
      setError("");
      const res = await axiosInstance.get("incidents/");
      setIncidents(parseList(res.data));
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load incidents.");
    } finally { setLoading(false); }
  };

  useEffect(() => { refreshData(); }, []);

  const handleIncidentStatus = async (incidentId, status) => {
    const key = `incident-${incidentId}`;
    try {
      setActionState((prev) => ({ ...prev, [key]: true }));
      await axiosInstance.patch(`incidents/admin/${incidentId}/update/`, { status });
      await refreshData();
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not update incident status.");
    } finally {
      setActionState((prev) => ({ ...prev, [key]: false }));
    }
  };

  if (loading) return <div className="rounded-3xl border border-[#d4e2eb] bg-white p-8 text-sm text-[var(--text-soft)]">Loading incidents...</div>;

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-[#d4e2eb] bg-white p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-soft)]">Incidents</p>
        <h1 className="mt-2 text-3xl font-extrabold text-[var(--text)]">Incident Moderation</h1>
      </section>

      {error && <p className="rounded-xl bg-[#fff1f1] px-3 py-2 text-sm text-[#b42318]">{error}</p>}

      <section className="rounded-3xl border border-[#d4e2eb] bg-white">
        {incidents.filter((i) => i.status !== "rejected").map((incident) => {
          const loadingKey = `incident-${incident.id}`;
          const statusOptions = INCIDENT_STATUSES.filter((option) => !(incident.status === "verified" && option.value === "rejected"));
          return (
            <article key={incident.id} className="border-b border-[#ecf2f7] px-5 py-4 last:border-b-0">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-lg font-semibold text-[var(--text)]">{incident.title}</p>
                  <p className="text-sm text-[var(--text-soft)]">Status: {incident.status} | {incident.location}</p>
                  <p className="text-xs text-[var(--text-soft)]">Reported by {incident.reporter_name || "Unknown"} | {formatDate(incident.created_at)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((item) => (
                    <button key={item.value} onClick={() => handleIncidentStatus(incident.id, item.value)} disabled={!!actionState[loadingKey]} className="rounded-xl bg-[var(--brand)] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">
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
