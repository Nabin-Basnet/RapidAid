import { useEffect, useState } from "react";
import axiosInstance from "../../api/Axios";
import { formatDate, parseList } from "./adminUtils";

export default function AdminDonations() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [donations, setDonations] = useState([]);

  const refreshData = async () => {
    try {
      setError("");
      const res = await axiosInstance.get("donations/list/");
      setDonations(parseList(res.data));
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load donations.");
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
        <p className="text-slate-600 font-medium">Loading donations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs tracking-[0.22em] uppercase text-slate-500 font-semibold">
          Donations
        </p>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">
          Donation Activity
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Track financial and item contributions.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-200">
        {donations.length === 0 && (
          <p className="px-5 py-6 text-sm text-slate-500">
            No donations recorded.
          </p>
        )}

        {donations.map((donation) => (
          <div key={donation.id} className="px-5 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <p className="text-base font-semibold text-slate-900">
                  {donation.donor_name || "Anonymous"} • {donation.donation_type}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Incident ID: {donation.incident || "N/A"} |{" "}
                  {donation.donation_type === "money"
                    ? `Amount: ${donation.amount || 0}`
                    : `Item: ${donation.item_name || "N/A"} (${donation.quantity || 0})`}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Created: {formatDate(donation.created_at)}
                </p>
              </div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                {donation.is_anonymous ? "Anonymous" : "Named"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
