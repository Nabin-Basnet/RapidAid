import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import axiosInstance from "../../api/Axios";

export default function DonerRegister() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkDonor = async () => {
      try {
        if (!localStorage.getItem("access")) {
          navigate("/login");
          return;
        }

        const res = await axiosInstance.get("/donations/donor/me/");
        if (res.data?.has_donor) {
          localStorage.setItem("has_donor", "true");
          navigate("/donations");
          return;
        }
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          navigate("/login");
          return;
        }
      } finally {
        setChecking(false);
      }
    };
    checkDonor();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axiosInstance.post("/donations/donor/create/");
      localStorage.setItem("has_donor", "true");
      navigate("/donations");
    } catch (err) {
      const detail = String(err?.response?.data?.detail || "").toLowerCase();
      const status = err?.response?.status;
      if (status === 403 && detail.includes("already")) {
        localStorage.setItem("has_donor", "true");
        navigate("/donations");
        return;
      }
      setError(err?.response?.data?.detail || "Failed to create donor profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-wrap py-24">
      <div className="mx-auto max-w-xl rounded-[28px] border border-[#d4e2eb] bg-white p-8 text-center shadow-sm">
        <p className="inline-flex items-center gap-2 rounded-full bg-[#ecfffb] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand)]">
          <UserPlus size={14} />
          Donor Enrollment
        </p>
        <h1 className="mt-4 text-3xl font-extrabold text-[var(--text)]">Register as Donor</h1>
        <p className="mt-2 text-sm text-[var(--text-soft)]">Enroll once to donate across verified incidents.</p>

        {error && <p className="mt-4 rounded-xl bg-[#fff1f1] px-3 py-2 text-sm text-[#b42318]">{error}</p>}
        {checking && <p className="mt-4 text-sm text-[var(--text-soft)]">Checking donor profile...</p>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
          <div>
            <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Full Name</label>
            <input type="text" value={user?.full_name || ""} disabled className="w-full rounded-xl border border-[#d3e2eb] bg-[#f4f8fb] px-4 py-3" />
          </div>
          <button
            type="submit"
            disabled={loading || checking}
            className="w-full rounded-xl bg-[var(--brand)] py-3 text-sm font-bold text-white hover:bg-[var(--brand-strong)] disabled:opacity-60"
          >
            {loading ? "Registering..." : "Register as Donor"}
          </button>
        </form>
      </div>
    </div>
  );
}
