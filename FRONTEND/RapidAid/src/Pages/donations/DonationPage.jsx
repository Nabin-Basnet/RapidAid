import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/Axios";
import DonerRegister from "./DonerRegister";
import DonorProfile from "./DonorProfile";
import DonationHistory from "./DonorDetails";

const DonationPage = () => {
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

        if (exists) {
          localStorage.setItem("has_donor", "true");
        } else {
          localStorage.removeItem("has_donor");
        }
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
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
      <div className="min-h-screen pt-24 px-4">
        <div className="max-w-3xl mx-auto bg-white border rounded-2xl p-8 text-center text-slate-600">
          Checking donor profile...
        </div>
      </div>
    );
  }

  if (!hasDonor) {
    return <DonerRegister />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {error && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-600 font-semibold">
              Donor Hub
            </p>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-2">
              Your Donations
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Track your support across verified incidents.
            </p>
          </div>
          <button
            onClick={() => navigate("/donates")}
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition shadow-sm"
          >
            Donate Now
          </button>
        </div>

        <DonorProfile />
        <DonationHistory />
      </div>
    </div>
  );
};

export default DonationPage;
