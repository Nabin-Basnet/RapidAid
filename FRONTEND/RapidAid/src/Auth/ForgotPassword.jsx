import { useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/Axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await axiosInstance.post("auth/password-reset/request/", { email });
      setSuccess(res.data?.detail || "If this email exists, reset instructions were sent.");
      setEmail("");
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not process request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-wrap flex min-h-screen items-center justify-center py-20">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-[28px] border border-[#d3e2eb] bg-white p-8 shadow-xl">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand)]">Recovery</p>
        <h1 className="mt-2 text-3xl font-extrabold text-[var(--text)]">Forgot Password</h1>
        <p className="mt-2 text-sm text-[var(--text-soft)]">Enter your email and we will send a reset link.</p>
        {error && <p className="mt-4 rounded-xl bg-[#fff1f1] px-3 py-2 text-sm text-[#b42318]">{error}</p>}
        {success && <p className="mt-4 rounded-xl bg-[#ecfff7] px-3 py-2 text-sm text-[#0f7a5e]">{success}</p>}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          className="mt-5 w-full rounded-xl border border-[#d0dde7] px-4 py-3 outline-none transition focus:border-[var(--brand)]"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-xl bg-[var(--brand)] px-3 py-3 text-sm font-bold text-white transition hover:bg-[var(--brand-strong)] disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
        <p className="mt-4 text-sm text-[var(--text-soft)]">
          Back to <Link className="font-bold text-[var(--brand)]" to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
