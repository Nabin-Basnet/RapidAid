import { useState } from "react";
import axiosInstance from "../../api/Axios";

const defaultForm = { full_name: "", email: "", phone: "", password: "", role: "rescue_team" };

export default function AdminCreateUser() {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      await axiosInstance.post("auth/admin/create-user/", form);
      setSuccess("User created successfully.");
      setForm(defaultForm);
    } catch (err) {
      setError(err?.response?.data?.detail || (typeof err?.response?.data === "object" ? JSON.stringify(err.response.data) : "Could not create user."));
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-[#d4e2eb] bg-white p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-soft)]">Users</p>
        <h1 className="mt-2 text-3xl font-extrabold text-[var(--text)]">Create User</h1>
      </section>

      {error && <p className="rounded-xl bg-[#fff1f1] px-3 py-2 text-sm text-[#b42318]">{error}</p>}
      {success && <p className="rounded-xl bg-[#ecfff7] px-3 py-2 text-sm text-[#0f7a5e]">{success}</p>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 rounded-3xl border border-[#d4e2eb] bg-white p-6 md:grid-cols-2">
        <input name="full_name" value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} required className="md:col-span-2 rounded-xl border border-[#cfdee8] px-3 py-2" placeholder="Full Name" />
        <input type="email" name="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required className="rounded-xl border border-[#cfdee8] px-3 py-2" placeholder="Email" />
        <input name="phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="rounded-xl border border-[#cfdee8] px-3 py-2" placeholder="Phone" />
        <input type="password" name="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required className="rounded-xl border border-[#cfdee8] px-3 py-2" placeholder="Password" />
        <select name="role" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} className="rounded-xl border border-[#cfdee8] px-3 py-2">
          <option value="admin">Admin</option>
          <option value="rescue_team">Rescue Team</option>
          <option value="assessment_team">Assessment Team</option>
          <option value="citizen">Citizen</option>
        </select>
        <button type="submit" disabled={loading} className="md:col-span-2 rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{loading ? "Creating..." : "Create User"}</button>
      </form>
    </div>
  );
}
