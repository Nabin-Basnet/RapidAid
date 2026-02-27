import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HandHeart } from "lucide-react";
import axiosInstance from "../../api/Axios";
import DonerRegister from "./DonerRegister";
import DonorProfile from "./DonorProfile";
import DonationHistory from "./DonorDetails";

export default function DonationPage() {
  const navigate = useNavigate();
  const [checkingDonor, setCheckingDonor] = useState(true);
  const [hasDonor, setHasDonor] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkDonorStatus = async () => {
      const token = localStorage.getItem("access");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setError("");
        const res = await axiosInstance.get("/donations/donor/me/");
        const exists = res.data?.has_donor === true;
        setHasDonor(exists);

        if (exists) localStorage.setItem("has_donor", "true");
        else localStorage.removeItem("has_donor");
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          navigate("/login");
          return;
        }
        setError("Could not check donor profile status.");
      } finally {
        setCheckingDonor(false);
      }
    };

    checkDonorStatus();
  }, [navigate]);

  if (checkingDonor) {
    return (
      <div className="section-wrap min-h-screen pt-28">
        <div className="rounded-3xl border border-[#d4e2eb] bg-white p-8 text-center text-sm text-[var(--text-soft)]">
          Checking donor profile...
        </div>
      </div>
    );
  }

  if (!hasDonor) return <DonerRegister />;

  return (
    <div className="section-wrap pb-12 pt-24">
      <section className="rounded-[28px] border border-[#cddde7] bg-[#0f2a3f] p-7 text-white md:p-9">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em]">
          <HandHeart size={14} />
          Donor Hub
        </p>
        <h1 className="mt-4 text-4xl font-extrabold">Support Tracking</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#c7d6e3]">
          Monitor your contribution history and continue supporting verified incidents.
        </p>
        <button
          onClick={() => navigate("/donates")}
          className="mt-5 rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--brand-strong)]"
        >
          Donate Now
        </button>
      </section>

      {error && <p className="mt-4 rounded-xl bg-[#fff1f1] px-3 py-2 text-sm text-[#b42318]">{error}</p>}

      <div className="mt-6 space-y-6">
        <DonorProfile />
        <DonationHistory />
      </div>
    </div>
  );
}
