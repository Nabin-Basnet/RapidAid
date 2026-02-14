import { useEffect, useState } from "react";
import axiosInstance from "../../api/Axios";
import { formatDate, parseList } from "./adminUtils";

const VOLUNTEER_STATUSES = [
  { label: "Approve", value: "approved" },
  { label: "Reject", value: "rejected" },
  { label: "Complete", value: "completed" },
];

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
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load volunteers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleVolunteerStatus = async (assignmentId, status) => {
    const key = `volunteer-${assignmentId}`;
    try {
      setActionState((prev) => ({ ...prev, [key]: true }));
      await axiosInstance.patch(`volunteer/update/${assignmentId}/`, {
        status,
      });
      await refreshData();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Could not update volunteer status. Please try again."
      );
    } finally {
      setActionState((prev) => ({ ...prev, [key]: false }));
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
        <p className="text-slate-600 font-medium">Loading volunteers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs tracking-[0.22em] uppercase text-slate-500 font-semibold">
          Volunteers
        </p>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">
          Volunteer Applications
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Approve or reject volunteer applications.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-200">
        {assignments.length === 0 && (
          <p className="px-5 py-6 text-sm text-slate-500">
            No volunteer applications available.
          </p>
        )}

        {assignments.map((assignment) => {
          const loadingKey = `volunteer-${assignment.id}`;
          return (
            <div key={assignment.id} className="px-5 py-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    {assignment.user_name || "Volunteer"} for{" "}
                    {assignment.incident_title || "Unknown incident"}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Status: <span className="font-semibold">{assignment.status}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Applied: {formatDate(assignment.applied_at)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {VOLUNTEER_STATUSES.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => handleVolunteerStatus(assignment.id, item.value)}
                      disabled={!!actionState[loadingKey]}
                      className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
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
