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
      setError(err.response?.data?.detail || "Failed to load incidents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleIncidentStatus = async (incidentId, status) => {
    const key = `incident-${incidentId}`;
    try {
      setActionState((prev) => ({ ...prev, [key]: true }));
      await axiosInstance.patch(`incidents/admin/${incidentId}/update/`, {
        status,
      });
      await refreshData();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Could not update incident status. Please try again."
      );
    } finally {
      setActionState((prev) => ({ ...prev, [key]: false }));
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
        <p className="text-slate-600 font-medium">Loading incidents...</p>
      </div>
    );
  }

  const visibleIncidents = incidents.filter((incident) => incident.status !== "rejected");

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs tracking-[0.22em] uppercase text-slate-500 font-semibold">
          Incidents
        </p>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">
          Incident Moderation
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Review reports and update incident status.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-200">
        {visibleIncidents.length === 0 && (
          <p className="px-5 py-6 text-sm text-slate-500">
            No incidents available.
          </p>
        )}

        {visibleIncidents.map((incident) => {
          const loadingKey = `incident-${incident.id}`;
          const statusOptions = INCIDENT_STATUSES.filter((option) => {
            if (incident.status === "verified" && option.value === "rejected") {
              return false;
            }
            return true;
          });
          return (
            <div key={incident.id} className="px-5 py-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    {incident.title}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Status: <span className="font-semibold">{incident.status}</span> |{" "}
                    {incident.location}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Reported by {incident.reporter_name || "Unknown"} |{" "}
                    {formatDate(incident.created_at)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => handleIncidentStatus(incident.id, item.value)}
                      disabled={!!actionState[loadingKey]}
                      className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-700 disabled:opacity-50"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
