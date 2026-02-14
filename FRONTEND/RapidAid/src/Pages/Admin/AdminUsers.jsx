import { useEffect, useState } from "react";
import axiosInstance from "../../api/Axios";
import { formatDate, parseList } from "./adminUtils";

export default function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);

  const refreshData = async () => {
    try {
      setError("");
      const res = await axiosInstance.get("auth/admin/users/");
      setUsers(parseList(res.data));
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
        <p className="text-slate-600 font-medium">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs tracking-[0.22em] uppercase text-slate-500 font-semibold">
          Users
        </p>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">
          User Directory
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          View admin, rescue, assessment, and citizen accounts.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-200">
        {users.length === 0 && (
          <p className="px-5 py-6 text-sm text-slate-500">
            No users available.
          </p>
        )}

        {users.map((user) => (
          <div key={user.id} className="px-5 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <p className="text-base font-semibold text-slate-900">
                  {user.full_name || "Unknown User"}
                </p>
                <p className="text-sm text-slate-500 mt-1">{user.email}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Joined: {formatDate(user.date_joined)}
                </p>
              </div>
              <div className="text-xs text-slate-600 font-semibold uppercase tracking-wider">
                {user.role_display || user.role || "unknown"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
