import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LifeBuoy, RefreshCcw, Users, ClipboardList } from "lucide-react";
import axiosInstance from "../../api/Axios";
import { parseList } from "../Admin/adminUtils";

const assignmentDefaults = { incident: "", team: "", notes: "" };
const teamDefaults = { name: "", organization: "" };
const memberDefaults = { team: "", user: "", role: "Responder" };
const memberRoles = ["Leader", "General Member", "Responder", "Medic", "Logistics", "Engineer", "Driver"];

export default function RescueDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [assignments, setAssignments] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [volunteerApplications, setVolunteerApplications] = useState([]);

  const [teamForm, setTeamForm] = useState(teamDefaults);
  const [memberForm, setMemberForm] = useState(memberDefaults);
  const [assignmentForm, setAssignmentForm] = useState(assignmentDefaults);

  const [teamLoading, setTeamLoading] = useState(false);
  const [memberLoading, setMemberLoading] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState({});
  const [deleteLoading, setDeleteLoading] = useState({});

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  }, []);
  const isAdmin = user?.role === "admin";

  const loadData = useCallback(async () => {
    try {
      setError("");
      const [assignmentRes, incidentRes, teamRes] = await Promise.all([
        axiosInstance.get("rescue/assignments/"),
        axiosInstance.get("incidents/"),
        axiosInstance.get("rescue/teams/"),
      ]);
      setAssignments(parseList(assignmentRes.data));
      setIncidents(parseList(incidentRes.data));
      const teamRows = parseList(teamRes.data);
      setTeams(teamRows);

      if (isAdmin) {
        const [userRes, volunteerRes] = await Promise.all([
          axiosInstance.get("auth/admin/users/"),
          axiosInstance.get("volunteer/list/"),
        ]);
        setUsers(parseList(userRes.data));
        setVolunteerApplications(parseList(volunteerRes.data));
      }
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        navigate("/login");
        return;
      }
      setError(err?.response?.data?.detail || "Failed to load rescue data.");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, navigate]);

  useEffect(() => { loadData(); }, [loadData]);

  const assignableIncidents = incidents.filter(
    (item) => ["verified", "in_rescue"].includes(String(item?.status || "").toLowerCase())
  );
  const rescueUsers = users.filter((item) => ["rescue_team", "admin"].includes(String(item?.role || "").toLowerCase()));
  const interestedVolunteerUsers = useMemo(() => {
    const map = new Map();
    volunteerApplications
      .filter((row) => ["pending", "approved"].includes(String(row?.status || "").toLowerCase()))
      .forEach((row) => {
        if (!row?.user) return;
        if (!map.has(row.user)) {
          map.set(row.user, {
            id: row.user,
            full_name: row.user_name || `User #${row.user}`,
            email: row.user_email || "",
            role: "volunteer",
          });
        }
      });
    return [...map.values()];
  }, [volunteerApplications]);
  const selectableUsers = useMemo(() => {
    const map = new Map();
    [...rescueUsers, ...interestedVolunteerUsers].forEach((row) => {
      if (!row?.id || map.has(row.id)) return;
      map.set(row.id, row);
    });
    return [...map.values()];
  }, [interestedVolunteerUsers, rescueUsers]);
  const teamMemberUserIds = useMemo(
    () => new Set(teams.flatMap((team) => (team?.members || []).map((member) => member.user))),
    [teams]
  );
  const unassignedSelectableUsers = selectableUsers.filter((row) => !teamMemberUserIds.has(row.id));

  const summary = useMemo(() => {
    const active = assignments.filter((a) => String(a?.status).toLowerCase() === "active").length;
    const completed = assignments.filter((a) => String(a?.status).toLowerCase() === "completed").length;
    return {
      teams: teams.length,
      assignments: assignments.length,
      active,
      completed,
    };
  }, [assignments, teams.length]);

  const createTeam = async (e) => {
    e.preventDefault();
    setTeamLoading(true); setError(""); setSuccess("");
    try {
      const res = await axiosInstance.post("rescue/teams/create/", teamForm);
      setSuccess("Rescue team created.");
      setTeamForm(teamDefaults);
      if (res?.data?.id) {
        setMemberForm((prev) => ({ ...prev, team: String(res.data.id) }));
      }
      await loadData();
    } catch (err) { setError(err?.response?.data?.detail || "Could not create team."); }
    finally { setTeamLoading(false); }
  };

  const addMember = async (e) => {
    e.preventDefault();
    setMemberLoading(true); setError(""); setSuccess("");
    try {
      await axiosInstance.post("rescue/teams/members/add/", {
        ...memberForm,
        team: Number(memberForm.team),
        user: Number(memberForm.user),
      });
      setSuccess("Team member added.");
      setMemberForm(memberDefaults);
      await loadData();
    } catch (err) { setError(err?.response?.data?.detail || "Could not add team member."); }
    finally { setMemberLoading(false); }
  };

  const createAssignment = async (e) => {
    e.preventDefault();
    setAssignmentLoading(true); setError(""); setSuccess("");
    try {
      await axiosInstance.post("rescue/assign/", {
        ...assignmentForm,
        incident: Number(assignmentForm.incident),
        team: Number(assignmentForm.team),
      });
      setSuccess("Rescue assignment created.");
      setAssignmentForm(assignmentDefaults);
      await loadData();
    } catch (err) { setError(err?.response?.data?.detail || "Could not assign team."); }
    finally { setAssignmentLoading(false); }
  };

  const updateStatus = async (id, status) => {
    setStatusLoading((prev) => ({ ...prev, [id]: true }));
    setError("");
    try {
      await axiosInstance.patch(`rescue/assignments/${id}/update/`, { status });
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not update assignment status.");
    } finally {
      setStatusLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const removeMember = async (memberId) => {
    setDeleteLoading((prev) => ({ ...prev, [`member-${memberId}`]: true }));
    setError("");
    setSuccess("");
    try {
      await axiosInstance.delete(`rescue/teams/members/${memberId}/delete/`);
      setSuccess("Team member removed.");
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not remove team member.");
    } finally {
      setDeleteLoading((prev) => ({ ...prev, [`member-${memberId}`]: false }));
    }
  };

  const deleteTeam = async (teamId) => {
    setDeleteLoading((prev) => ({ ...prev, [`team-${teamId}`]: true }));
    setError("");
    setSuccess("");
    try {
      await axiosInstance.delete(`rescue/teams/${teamId}/delete/`);
      setSuccess("Rescue team deleted.");
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not delete team.");
    } finally {
      setDeleteLoading((prev) => ({ ...prev, [`team-${teamId}`]: false }));
    }
  };

  if (loading) return <div className="section-wrap min-h-screen pt-28"><div className="rounded-3xl border border-[#d4e2eb] bg-white p-8 text-sm text-[var(--text-soft)]">Loading rescue dashboard...</div></div>;

  return (
    <div className="section-wrap pb-12 pt-24 space-y-5">
      <section className="rounded-[28px] border border-[#cddde7] bg-[#0f2a3f] p-7 text-white md:p-9">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]"><LifeBuoy size={14} />Rescue Ops</p>
        <h1 className="mt-4 text-4xl font-extrabold">Rescue Command Center</h1>
        <button onClick={loadData} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20">
          <RefreshCcw size={14} />
          Refresh Data
        </button>
      </section>

      {error && <p className="rounded-xl bg-[#fff1f1] px-3 py-2 text-sm text-[#b42318]">{error}</p>}
      {success && <p className="rounded-xl bg-[#ecfff7] px-3 py-2 text-sm text-[#0f7a5e]">{success}</p>}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[#d4e2eb] bg-white p-4">
          <p className="text-xs text-[var(--text-soft)]">Teams</p>
          <p className="text-2xl font-bold text-[var(--text)]">{summary.teams}</p>
        </div>
        <div className="rounded-2xl border border-[#d4e2eb] bg-white p-4">
          <p className="text-xs text-[var(--text-soft)]">Assignments</p>
          <p className="text-2xl font-bold text-[var(--text)]">{summary.assignments}</p>
        </div>
        <div className="rounded-2xl border border-[#d4e2eb] bg-white p-4">
          <p className="text-xs text-[var(--text-soft)]">Active</p>
          <p className="text-2xl font-bold text-[#1757b0]">{summary.active}</p>
        </div>
        <div className="rounded-2xl border border-[#d4e2eb] bg-white p-4">
          <p className="text-xs text-[var(--text-soft)]">Completed</p>
          <p className="text-2xl font-bold text-[#0f7a5e]">{summary.completed}</p>
        </div>
      </section>

      {isAdmin && (
        <div className="grid gap-4 lg:grid-cols-3">
          <form onSubmit={createTeam} className="rounded-3xl border border-[#d4e2eb] bg-white p-5 space-y-3">
            <h2 className="text-lg font-bold">Create Team</h2>
            <input value={teamForm.name} onChange={(e) => setTeamForm((p) => ({ ...p, name: e.target.value }))} className="w-full rounded-xl border border-[#cfdee8] px-3 py-2" placeholder="Team name" required />
            <input value={teamForm.organization} onChange={(e) => setTeamForm((p) => ({ ...p, organization: e.target.value }))} className="w-full rounded-xl border border-[#cfdee8] px-3 py-2" placeholder="Organization" required />
            <button type="submit" disabled={teamLoading} className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{teamLoading ? "Creating..." : "Create Team"}</button>
          </form>

          <form onSubmit={addMember} className="rounded-3xl border border-[#d4e2eb] bg-white p-5 space-y-3">
            <h2 className="text-lg font-bold">Add Member</h2>
            <select value={memberForm.team} onChange={(e) => setMemberForm((p) => ({ ...p, team: e.target.value }))} className="w-full rounded-xl border border-[#cfdee8] px-3 py-2" required>
              <option value="">Select team</option>
              {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
            <select value={memberForm.user} onChange={(e) => setMemberForm((p) => ({ ...p, user: e.target.value }))} className="w-full rounded-xl border border-[#cfdee8] px-3 py-2" required>
              <option value="">Select user</option>
              {(unassignedSelectableUsers.length > 0 ? unassignedSelectableUsers : selectableUsers).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.full_name}
                  {item.email ? ` (${item.email})` : ""}
                  {item.role === "volunteer" ? " - volunteer applicant" : ""}
                </option>
              ))}
            </select>
            <select value={memberForm.role} onChange={(e) => setMemberForm((p) => ({ ...p, role: e.target.value }))} className="w-full rounded-xl border border-[#cfdee8] px-3 py-2" required>
              {memberRoles.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
            <button type="submit" disabled={memberLoading} className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{memberLoading ? "Adding..." : "Add Member"}</button>
          </form>

          <form onSubmit={createAssignment} className="rounded-3xl border border-[#d4e2eb] bg-white p-5 space-y-3">
            <h2 className="text-lg font-bold">Assign Team</h2>
            <select value={assignmentForm.incident} onChange={(e) => setAssignmentForm((p) => ({ ...p, incident: e.target.value }))} className="w-full rounded-xl border border-[#cfdee8] px-3 py-2" required>
              <option value="">Select incident</option>
              {assignableIncidents.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
            </select>
            <select value={assignmentForm.team} onChange={(e) => setAssignmentForm((p) => ({ ...p, team: e.target.value }))} className="w-full rounded-xl border border-[#cfdee8] px-3 py-2" required>
              <option value="">Select team</option>
              {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
            <textarea rows={2} value={assignmentForm.notes} onChange={(e) => setAssignmentForm((p) => ({ ...p, notes: e.target.value }))} className="w-full rounded-xl border border-[#cfdee8] px-3 py-2" placeholder="Notes" />
            <button type="submit" disabled={assignmentLoading} className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{assignmentLoading ? "Assigning..." : "Assign Team"}</button>
          </form>
        </div>
      )}

      <section className="rounded-3xl border border-[#d4e2eb] bg-white">
        <div className="flex items-center gap-2 border-b border-[#e7eff5] px-5 py-4">
          <Users size={16} />
          <h2 className="text-lg font-bold">Teams and Members</h2>
        </div>
        {teams.length === 0 && <p className="px-5 py-6 text-sm text-[var(--text-soft)]">No rescue teams created yet.</p>}
        {teams.map((team) => (
          <div key={team.id} className="border-t border-[#ecf2f7] px-5 py-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-[var(--text)]">{team.name}</p>
                <p className="text-sm text-[var(--text-soft)]">{team.organization}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold uppercase text-[var(--text-soft)]">{team.member_count || team.members?.length || 0} member(s)</p>
                {isAdmin && (
                  <button
                    onClick={() => deleteTeam(team.id)}
                    disabled={deleteLoading[`team-${team.id}`]}
                    className="rounded-xl bg-[#b42318] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    Delete Team
                  </button>
                )}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(team.members || []).length === 0 ? (
                <p className="text-sm text-[var(--text-soft)]">No members yet.</p>
              ) : (
                (team.members || []).map((member) => (
                  <div key={member.id} className="flex items-center gap-2 rounded-full border border-[#d9e7f1] bg-[#f8fbff] px-3 py-1 text-xs text-[var(--text)]">
                    <span>{member.user_name} - {member.role}</span>
                    {isAdmin && (
                      <button
                        onClick={() => removeMember(member.id)}
                        disabled={deleteLoading[`member-${member.id}`]}
                        className="font-semibold text-[#b42318] disabled:opacity-60"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-[#d4e2eb] bg-white">
        <div className="flex items-center gap-2 border-b border-[#e7eff5] px-5 py-4">
          <ClipboardList size={16} />
          <h2 className="text-lg font-bold">Assignments</h2>
        </div>
        {assignments.length === 0 && <p className="px-5 py-6 text-sm text-[var(--text-soft)]">No assignments found.</p>}
        {assignments.map((item) => (
          <div key={item.id} className="flex flex-col gap-3 border-t border-[#ecf2f7] px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-[var(--text)]">
                {item.team_name || `Team #${item.team}`}
                {" -> "}
                {item.incident_title || `Incident #${item.incident}`}
              </p>
              <p className="text-sm text-[var(--text-soft)]">Status: {item.status}</p>
              {item.notes && <p className="text-sm text-[var(--text-soft)]">Notes: {item.notes}</p>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => updateStatus(item.id, "active")} disabled={statusLoading[item.id]} className="rounded-xl bg-[#1757b0] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60">Active</button>
              <button onClick={() => updateStatus(item.id, "completed")} disabled={statusLoading[item.id]} className="rounded-xl bg-[#0f7a5e] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60">Complete</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
