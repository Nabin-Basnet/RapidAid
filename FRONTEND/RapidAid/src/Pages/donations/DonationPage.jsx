import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DonerRegister from "./DonerRegister";
import DonorProfile from "./DonorProfile";
import DonationHistory from "./DonorDetails";

const DonationPage = () => {
  const navigate = useNavigate();

  const hasDonor = useMemo(
    () => localStorage.getItem("has_donor") === "true",
    []
  );

  if (!hasDonor) {
    return <DonerRegister />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
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
