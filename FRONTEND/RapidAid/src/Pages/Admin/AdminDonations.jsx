import { useEffect, useState } from "react";
import axiosInstance from "../../api/Axios";
import { formatDate, parseList } from "./adminUtils";

export default function AdminDonations() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    const refreshData = async () => {
      try {
        setError("");
        const res = await axiosInstance.get("donations/list/");
        setDonations(parseList(res.data));
      } catch (err) { setError(err?.response?.data?.detail || "Failed to load donations."); }
      finally { setLoading(false); }
    };
    refreshData();
  }, []);

  if (loading) return <div className="rounded-3xl border border-[#d4e2eb] bg-white p-8 text-sm text-[var(--text-soft)]">Loading donations...</div>;

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-[#d4e2eb] bg-white p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-soft)]">Donations</p>
        <h1 className="mt-2 text-3xl font-extrabold text-[var(--text)]">Donation Activity</h1>
      </section>
      {error && <p className="rounded-xl bg-[#fff1f1] px-3 py-2 text-sm text-[#b42318]">{error}</p>}

      <section className="rounded-3xl border border-[#d4e2eb] bg-white">
        {donations.length === 0 && <p className="px-5 py-6 text-sm text-[var(--text-soft)]">No donations recorded.</p>}
        {donations.map((donation) => (
          <article key={donation.id} className="border-b border-[#ecf2f7] px-5 py-4 last:border-b-0">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-lg font-semibold text-[var(--text)]">{donation.donor_name || "Anonymous"} - {donation.donation_type}</p>
                <p className="text-sm text-[var(--text-soft)]">{donation.incident_title || `Incident ID: ${donation.incident || "N/A"}`} | {donation.donation_type === "money" ? `Amount: NPR ${donation.amount || 0}` : `Item: ${donation.item_name || "N/A"} (${donation.quantity || 0})`}</p>
                <p className="text-xs text-[var(--text-soft)]">Created: {formatDate(donation.created_at)}</p>
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-soft)]">{donation.is_anonymous ? "Anonymous" : "Named"}</div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
