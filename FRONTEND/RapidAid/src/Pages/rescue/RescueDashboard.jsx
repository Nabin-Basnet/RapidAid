import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/Axios";
import { parseList } from "../Admin/adminUtils";

const assignmentDefaults = {
  incident: "",
  team: "",
  notes: "",
};

const teamDefaults = {
  name: "",
  organization: "",
};

const memberDefaults = {
  team: "",
  user: "",
  role: "",
};

export default function RescueDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [assignments, setAssignments] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [users, setUsers] = useState([]);

  const [teamForm, setTeamForm] = useState(teamDefaults);
  const [memberForm, setMemberForm] = useState(memberDefaults);
  const [assignmentForm, setAssignmentForm] = useState(assignmentDefaults);

  const [teamLoading, setTeamLoading] = useState(false);
  const [memberLoading, setMemberLoading] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState({});

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);
  const isAdmin = user?.role === "admin";

  const loadData = useCallback(async () => {
    try {
      setError("");
      const [assignmentRes, incidentRes] = await Promise.all([
        axiosInstance.get("rescue/assignments/"),
        axiosInstance.get("incidents/"),
      ]);
      setAssignments(parseList(assignmentRes.data));
      setIncidents(parseList(incidentRes.data));

      if (isAdmin) {
        const userRes = await axiosInstance.get("auth/admin/users/");
        setUsers(parseList(userRes.data));
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        navigate("/login");
        return;
      }
      setError(err?.response?.data?.detail || "Failed to load rescue data.");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const teams = useMemo(() => {
    const map = new Map();
    assignments.forEach((item) => {
      if (item?.team) {
        map.set(item.team, {
          id: item.team,
          name: item.team_name || `Team #${item.team}`,
        });
      }
    });
    return [...map.values()];
  }, [assignments]);

  const assignableIncidents = useMemo(
    () =>
      incidents.filter((item) => {
        const status = String(item?.status || "").toLowerCase();
        return status === "verified" || status === "in_rescue";
      }),
    [incidents]
  );

  const rescueUsers = useMemo(
    () =>
      users.filter((item) => {
        const role = String(item?.role || "").toLowerCase();
        return role === "rescue_team" || role === "admin";
      }),
    [users]
  );

  const createTeam = async (e) => {
    e.preventDefault();
    setTeamLoading(true);
    setError("");
    setSuccess("");
    try {
      await axiosInstance.post("rescue/teams/create/", teamForm);
      setSuccess("Rescue team created.");
      setTeamForm(teamDefaults);
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not create rescue team.");
    } finally {
      setTeamLoading(false);
    }
  };

  const addMember = async (e) => {
    e.preventDefault();
    setMemberLoading(true);
    setError("");
    setSuccess("");
    try {
      await axiosInstance.post("rescue/teams/members/add/", memberForm);
      setSuccess("Team member added.");
      setMemberForm(memberDefaults);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not add team member.");
    } finally {
      setMemberLoading(false);
    }
  };

  const createAssignment = async (e) => {
    e.preventDefault();
    setAssignmentLoading(true);
    setError("");
    setSuccess("");
    try {
      await axiosInstance.post("rescue/assign/", assignmentForm);
      setSuccess("Rescue assignment created.");
      setAssignmentForm(assignmentDefaults);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not assign team to incident.");
    } finally {
      setAssignmentLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    setStatusLoading((prev) => ({ ...prev, [id]: true }));
    setError("");
    setSuccess("");
    try {
      await axiosInstance.patch(`rescue/assignments/${id}/update/`, { status });
      setSuccess(`Assignment #${id} marked as ${status}.`);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not update assignment status.");
    } finally {
      setStatusLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <div className="max-w-6xl mx-auto bg-white border rounded-2xl p-8 text-center text-slate-600">
          Loading rescue dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-indigo-600 font-semibold">
            Rescue
          </p>
          <h1 className="text-3xl font-bold text-slate-900 mt-2">Rescue Operations</h1>
          <p className="text-sm text-slate-500 mt-2">
            Manage teams, assignments, and incident rescue status.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        {isAdmin && (
          <div className="grid lg:grid-cols-3 gap-4">
            <form onSubmit={createTeam} className="bg-white border rounded-2xl p-4 space-y-3">
              <h2 className="font-semibold text-slate-900">Create Team</h2>
              <input
                value={teamForm.name}
                onChange={(e) => setTeamForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Team name"
                required
              />
              <input
                value={teamForm.organization}
                onChange={(e) =>
                  setTeamForm((prev) => ({ ...prev, organization: e.target.value }))
                }
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Organization"
                required
              />
              <button
                type="submit"
                disabled={teamLoading}
                className="bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
              >
                {teamLoading ? "Creating..." : "Create Team"}
              </button>
            </form>

            <form onSubmit={addMember} className="bg-white border rounded-2xl p-4 space-y-3">
              <h2 className="font-semibold text-slate-900">Add Member</h2>
              <select
                value={memberForm.team}
                onChange={(e) => setMemberForm((prev) => ({ ...prev, team: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2"
                required
              >
                <option value="">Select team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              <select
                value={memberForm.user}
                onChange={(e) => setMemberForm((prev) => ({ ...prev, user: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2"
                required
              >
                <option value="">Select user</option>
                {rescueUsers.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.full_name} ({item.email})
                  </option>
                ))}
              </select>
              <input
                value={memberForm.role}
                onChange={(e) => setMemberForm((prev) => ({ ...prev, role: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Role (Leader, Medic)"
                required
              />
              <button
                type="submit"
                disabled={memberLoading}
                className="bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
              >
                {memberLoading ? "Adding..." : "Add Member"}
              </button>
            </form>

            <form onSubmit={createAssignment} className="bg-white border rounded-2xl p-4 space-y-3">
              <h2 className="font-semibold text-slate-900">Assign Team</h2>
              <select
                value={assignmentForm.incident}
                onChange={(e) =>
                  setAssignmentForm((prev) => ({ ...prev, incident: e.target.value }))
                }
                className="w-full border rounded-lg px-3 py-2"
                required
              >
                <option value="">Select incident</option>
                {assignableIncidents.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
              <select
                value={assignmentForm.team}
                onChange={(e) => setAssignmentForm((prev) => ({ ...prev, team: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2"
                required
              >
                <option value="">Select team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              <textarea
                rows={2}
                value={assignmentForm.notes}
                onChange={(e) => setAssignmentForm((prev) => ({ ...prev, notes: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Notes"
              />
              <button
                type="submit"
                disabled={assignmentLoading}
                className="bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
              >
                {assignmentLoading ? "Assigning..." : "Assign Team"}
              </button>
            </form>
          </div>
        )}

        <div className="bg-white border rounded-2xl divide-y">
          <div className="px-5 py-4">
            <h2 className="font-semibold text-slate-900">Assignments</h2>
          </div>
          {assignments.length === 0 && (
            <p className="px-5 py-6 text-sm text-slate-500">No assignments found.</p>
          )}
          {assignments.map((item) => (
            <div key={item.id} className="px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">
                  {item.team_name || `Team #${item.team}`}
                  {" -> "}
                  {item.incident_title || `Incident #${item.incident}`}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Status: <span className="font-semibold">{item.status}</span>
                </p>
                {item.notes ? <p className="text-sm text-slate-500 mt-1">{item.notes}</p> : null}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus(item.id, "active")}
                  disabled={statusLoading[item.id]}
                  className="px-3 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white disabled:opacity-60"
                >
                  Active
                </button>
                <button
                  onClick={() => updateStatus(item.id, "completed")}
                  disabled={statusLoading[item.id]}
                  className="px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white disabled:opacity-60"
                >
                  Complete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
