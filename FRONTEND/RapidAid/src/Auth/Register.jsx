import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/Axios";

const defaultForm = {
  full_name: "",
  email: "",
  phone: "",
  password: "",
  role: "citizen",
};

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(defaultForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await axiosInstance.post("auth/register/", formData);
      setSuccess("Registration successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(
        typeof err?.response?.data === "object"
          ? JSON.stringify(err.response.data)
          : "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-wrap flex min-h-screen items-center justify-center py-20">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl rounded-[28px] border border-[#d3e2eb] bg-white p-8 shadow-xl md:p-10"
      >
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand)]">Create Account</p>
        <h1 className="mt-2 text-3xl font-extrabold text-[var(--text)]">Join RapidAid</h1>
        <p className="mt-2 text-sm text-[var(--text-soft)]">
          Register as a citizen to report incidents, volunteer, and support relief efforts.
        </p>

        {error && <p className="mt-4 rounded-xl bg-[#fff1f1] px-3 py-2 text-sm text-[#b42318]">{error}</p>}
        {success && <p className="mt-4 rounded-xl bg-[#ecfff7] px-3 py-2 text-sm text-[#0f7a5e]">{success}</p>}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#d0dde7] px-4 py-3 outline-none transition focus:border-[var(--brand)]"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#d0dde7] px-4 py-3 outline-none transition focus:border-[var(--brand)]"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#d0dde7] px-4 py-3 outline-none transition focus:border-[var(--brand)]"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#d0dde7] px-4 py-3 outline-none transition focus:border-[var(--brand)]"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-[var(--brand)] py-3 text-sm font-bold text-white transition hover:bg-[var(--brand-strong)] disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p className="mt-5 text-center text-sm text-[var(--text-soft)]">
          Already have an account?{" "}
          <button type="button" onClick={() => navigate("/login")} className="font-bold text-[var(--brand)]">
            Login
          </button>
        </p>
      </form>
    </div>
  );
}
