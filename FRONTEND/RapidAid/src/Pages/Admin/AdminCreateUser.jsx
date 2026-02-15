import { useState } from "react";
import axiosInstance from "../../api/Axios";

const defaultForm = {
  full_name: "",
  email: "",
  phone: "",
  password: "",
  role: "rescue_team",
};

export default function AdminCreateUser() {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await axiosInstance.post("auth/admin/create-user/", form);
      setSuccess("User created successfully.");
      setForm(defaultForm);
    } catch (err) {
      const detail =
        err?.response?.data?.detail ||
        (typeof err?.response?.data === "object"
          ? JSON.stringify(err.response.data)
          : "Could not create user.");
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs tracking-[0.22em] uppercase text-slate-500 font-semibold">
          Users
        </p>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Create User</h1>
        <p className="text-sm text-slate-500 mt-2">
          Create admin, rescue team, assessment team, or citizen users.
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

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="md:col-span-2">
          <label className="block text-sm text-slate-700 mb-1">Full Name</label>
          <input
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-700 mb-1">Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-700 mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-700 mb-1">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="admin">Admin</option>
            <option value="rescue_team">Rescue Team</option>
            <option value="assessment_team">Assessment Team</option>
            <option value="citizen">Citizen</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </div>
      </form>
    </div>
  );
}
