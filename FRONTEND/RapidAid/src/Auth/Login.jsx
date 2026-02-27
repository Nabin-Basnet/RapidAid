import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../api/Axios";

const initialState = { email: "", password: "" };

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axiosInstance.post("auth/login/", formData);
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate(location.state?.from || "/");
    } catch (err) {
      setError(err?.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-wrap flex min-h-screen items-center justify-center py-20">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-[#d3e2eb] bg-white shadow-xl lg:grid-cols-2">
        <div className="hidden bg-[#0f2a3f] p-10 text-white lg:block">
          <p className="text-xs uppercase tracking-[0.22em] text-[#96b7d0]">RapidAid Secure Access</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">Operational Control Starts Here</h1>
          <p className="mt-4 text-sm text-[#c6d6e3]">
            Sign in to manage incidents, coordinate rescue actions, and access transparent support records.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 md:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand)]">Welcome Back</p>
          <h2 className="mt-2 text-3xl font-extrabold text-[var(--text)]">Sign in to RapidAid</h2>
          {error && (
            <p className="mt-4 rounded-xl border border-[#fbcfcf] bg-[#fff1f1] px-3 py-2 text-sm text-[#b42318]">
              {error}
            </p>
          )}
          <div className="mt-6 space-y-4">
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
          <div className="mt-3 text-right">
            <Link to="/forgot-password" className="text-sm font-semibold text-[var(--brand)]">Forgot password?</Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-xl bg-[var(--brand)] py-3 text-sm font-bold text-white transition hover:bg-[var(--brand-strong)] disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
          <p className="mt-5 text-center text-sm text-[var(--text-soft)]">
            New here?{" "}
            <button type="button" onClick={() => navigate("/register")} className="font-bold text-[var(--brand)]">
              Create account
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
