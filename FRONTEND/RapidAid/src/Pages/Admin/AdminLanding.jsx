import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/Axios";
import { parseList } from "./adminUtils";

export default function AdminLanding() {

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [incidents, setIncidents] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [users, setUsers] = useState([]);
  const refreshData = async () => {
    try {
      setError("");
      const [incidentRes, volunteerRes, donationRes, usersRes] =
        await Promise.all([
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
      setError(
        err.response?.data?.detail || "Failed to load admin dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const pendingIncidents = incidents.filter((item) => item.status === "reported");
  const pendingVolunteers = volunteers.filter((item) => item.status === "pending");

  if (loading) {
    return (
      <div className="bg-slate-50 p-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <p className="text-slate-600 font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.22em] uppercase text-slate-500 font-semibold">
            Control Panel
          </p>
          <h1 className="text-3xl font-bold text-slate-900 mt-1">
            Admin Landing
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Choose a workspace or review the quick status summary.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex justify-center px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-100"
        >
          Back to Site
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Users</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{users.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Incidents</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{incidents.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Donations</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{donations.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Pending Volunteers</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {pendingVolunteers.length}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Link
          to="/admin/incidents"
          className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition"
        >
          <p className="text-xs uppercase tracking-wider text-slate-500">Incidents</p>
          <p className="text-lg font-semibold text-slate-900 mt-2">
            Moderate reports and update incident status.
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Pending incidents: {pendingIncidents.length}
          </p>
        </Link>

        <Link
          to="/admin/volunteers"
          className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition"
        >
          <p className="text-xs uppercase tracking-wider text-slate-500">Volunteers</p>
          <p className="text-lg font-semibold text-slate-900 mt-2">
            Approve, reject, or complete volunteer applications.
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Pending volunteers: {pendingVolunteers.length}
          </p>
        </Link>

        <Link
          to="/admin/donations"
          className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition"
        >
          <p className="text-xs uppercase tracking-wider text-slate-500">Donations</p>
          <p className="text-lg font-semibold text-slate-900 mt-2">
            Review donations and donor activity.
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Total donations: {donations.length}
          </p>
        </Link>

        <Link
          to="/admin/users"
          className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition"
        >
          <p className="text-xs uppercase tracking-wider text-slate-500">Users</p>
          <p className="text-lg font-semibold text-slate-900 mt-2">
            Manage admin, rescue, and assessment users.
          </p>
          <p className="text-sm text-slate-500 mt-2">Total users: {users.length}</p>
        </Link>

        <Link
          to="/admin/create-user"
          className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition"
        >
          <p className="text-xs uppercase tracking-wider text-slate-500">User Provisioning</p>
          <p className="text-lg font-semibold text-slate-900 mt-2">
            Create admin, rescue, assessment, and citizen accounts.
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Faster onboarding for role-based teams.
          </p>
        </Link>

        <Link
          to="/admin/rescue"
          className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition"
        >
          <p className="text-xs uppercase tracking-wider text-slate-500">Rescue Ops</p>
          <p className="text-lg font-semibold text-slate-900 mt-2">
            Manage rescue teams and assignments.
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Coordinate incident response execution.
          </p>
        </Link>

        <Link
          to="/admin/assessments"
          className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition"
        >
          <p className="text-xs uppercase tracking-wider text-slate-500">Assessments</p>
          <p className="text-lg font-semibold text-slate-900 mt-2">
            Record affected families and damage assessments.
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Keep verified impact records.
          </p>
        </Link>

        <Link
          to="/admin/ledger"
          className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition"
        >
          <p className="text-xs uppercase tracking-wider text-slate-500">Ledger</p>
          <p className="text-lg font-semibold text-slate-900 mt-2">
            View and log audit trail entries.
          </p>
          <p className="text-sm text-slate-500 mt-2">
            End-to-end traceability of key changes.
          </p>
        </Link>
      </div>
    </div>
  );
}
