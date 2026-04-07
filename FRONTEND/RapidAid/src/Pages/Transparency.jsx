import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Wallet, Package, BanknoteArrowDown, Landmark, AlertTriangle } from "lucide-react";
import axiosInstance from "../api/Axios";

const currencyFormatter = new Intl.NumberFormat("en-NP", {
  style: "currency",
  currency: "NPR",
  maximumFractionDigits: 0,
});

const normalizeList = (payload) => {
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload)) return payload;
  return [];
};

const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : "N/A");

export default function Transparency() {
  const [donations, setDonations] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const [donationRes, incidentRes] = await Promise.all([
          axiosInstance.get("/donations/list/"),
          axiosInstance.get("/incidents/"),
        ]);
        setDonations(normalizeList(donationRes.data));
        setIncidents(normalizeList(incidentRes.data));
      } catch (err) {
        setError(err?.response?.data?.detail || "Transparency data could not be loaded right now.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const metrics = useMemo(() => {
    const money = donations.filter((d) => String(d?.donation_type).toLowerCase() === "money");
    const items = donations.filter((d) => String(d?.donation_type).toLowerCase() === "item");
    const totalAmount = money.reduce((sum, d) => sum + Number(d?.amount || 0), 0);
    return {
      total: donations.length,
      moneyCount: money.length,
      itemCount: items.length,
      totalAmount,
      anonymousCount: donations.filter((d) => d?.is_anonymous).length,
    };
  }, [donations]);

  const incidentBreakdown = useMemo(() => {
    const incidentMap = incidents.reduce((acc, incident) => {
      acc[incident.id] = incident;
      return acc;
    }, {});

    return Object.values(
      donations.reduce((acc, donation) => {
        const incidentId = donation.incident;
        const incident = incidentMap[incidentId];
        const key = incidentId || `unknown-${donation.id}`;

        if (!acc[key]) {
          acc[key] = {
            incidentId,
            title: donation.incident_title || incident?.title || `Incident #${incidentId}`,
            status: incident?.status || "unknown",
            severity: incident?.severity || "unknown",
            money: 0,
            items: 0,
            entries: 0,
          };
        }

        acc[key].entries += 1;
        if (String(donation.donation_type).toLowerCase() === "money") {
          acc[key].money += Number(donation.amount || 0);
        } else {
          acc[key].items += Number(donation.quantity || 0);
        }

        return acc;
      }, {})
    ).sort((a, b) => b.money - a.money || b.entries - a.entries);
  }, [donations, incidents]);

  return (
    <div className="section-wrap pb-12 pt-24">
      <div className="rounded-[28px] border border-[#cddde7] bg-[#0f2a3f] p-7 text-white md:p-9">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em]">
          <ShieldCheck size={14} />
          Public Accountability
        </p>
        <h1 className="mt-4 text-4xl font-extrabold">Transparency Ledger</h1>
        <p className="mt-2 max-w-3xl text-sm text-[#c8d7e4]">
          Every donation entry below is pulled from live platform records to keep support activity auditable and visible.
        </p>
      </div>

      {loading ? (
        <div className="mt-6 rounded-3xl border border-[#d4e2eb] bg-white p-8 text-sm text-[var(--text-soft)]">
          Loading transparency records...
        </div>
      ) : error ? (
        <div className="mt-6 rounded-3xl border border-[#fecaca] bg-[#fff1f1] p-8 text-sm text-[#b42318]">
          <p className="font-semibold">Unable to load transparency data.</p>
          <p className="mt-2">{error}</p>
          <p className="mt-2">
            If this is an authentication issue, <Link to="/login" className="font-semibold underline">log in here</Link>.
          </p>
        </div>
      ) : (
        <>
          <section className="mt-6 grid gap-4 md:grid-cols-5">
            <div className="rounded-2xl border border-[#d4e2eb] bg-white p-4">
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--text-soft)]"><Wallet size={14} />Total Entries</p>
              <p className="mt-2 text-2xl font-bold text-[var(--text)]">{metrics.total}</p>
            </div>
            <div className="rounded-2xl border border-[#d4e2eb] bg-white p-4">
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--text-soft)]"><BanknoteArrowDown size={14} />Money</p>
              <p className="mt-2 text-2xl font-bold text-[#0f7a5e]">{metrics.moneyCount}</p>
            </div>
            <div className="rounded-2xl border border-[#d4e2eb] bg-white p-4">
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--text-soft)]"><Package size={14} />Items</p>
              <p className="mt-2 text-2xl font-bold text-[#1757b0]">{metrics.itemCount}</p>
            </div>
            <div className="rounded-2xl border border-[#d4e2eb] bg-white p-4">
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--text-soft)]"><Landmark size={14} />Total Amount</p>
              <p className="mt-2 text-xl font-bold text-[var(--text)]">{currencyFormatter.format(metrics.totalAmount)}</p>
            </div>
            <div className="rounded-2xl border border-[#d4e2eb] bg-white p-4">
              <p className="text-xs uppercase tracking-wider text-[var(--text-soft)]">Anonymous</p>
              <p className="mt-2 text-2xl font-bold text-[#a93f1b]">{metrics.anonymousCount}</p>
            </div>
          </section>

          <section className="mt-6 rounded-3xl border border-[#d4e2eb] bg-white">
            <div className="border-b border-[#e7eff5] bg-[#f8fcff] px-5 py-4">
              <h2 className="text-lg font-bold text-[var(--text)]">Incident Support Breakdown</h2>
            </div>
            {incidentBreakdown.length === 0 ? (
              <p className="px-5 py-8 text-sm text-[var(--text-soft)]">No incident-linked donations available yet.</p>
            ) : (
              <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
                {incidentBreakdown.map((item) => (
                  <article key={item.incidentId || item.title} className="rounded-2xl border border-[#deebf3] bg-[#f8fcff] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-[var(--text)]">{item.title}</h3>
                        <p className="mt-1 text-xs uppercase tracking-wide text-[var(--text-soft)]">
                          Status: {item.status} | Severity: {item.severity}
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--text-soft)]">
                        {item.entries} entr{item.entries === 1 ? "y" : "ies"}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-[#e3edf4] bg-white p-3">
                        <p className="text-xs text-[var(--text-soft)]">Money Raised</p>
                        <p className="mt-1 text-lg font-bold text-[var(--text)]">{currencyFormatter.format(item.money)}</p>
                      </div>
                      <div className="rounded-xl border border-[#e3edf4] bg-white p-3">
                        <p className="text-xs text-[var(--text-soft)]">Items Donated</p>
                        <p className="mt-1 text-lg font-bold text-[var(--text)]">{item.items}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="mt-6 overflow-hidden rounded-3xl border border-[#d4e2eb] bg-white">
            <div className="border-b border-[#e7eff5] bg-[#f8fcff] px-5 py-4">
              <h2 className="text-lg font-bold text-[var(--text)]">Recent Donation Entries</h2>
            </div>
            {donations.length === 0 ? (
              <p className="px-5 py-8 text-sm text-[var(--text-soft)]">No donation entries found yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#f8fcff] text-[var(--text-soft)]">
                    <tr>
                      <th className="px-5 py-3 text-left font-semibold">Date</th>
                      <th className="px-5 py-3 text-left font-semibold">Donor</th>
                      <th className="px-5 py-3 text-left font-semibold">Type</th>
                      <th className="px-5 py-3 text-left font-semibold">Value</th>
                      <th className="px-5 py-3 text-left font-semibold">Incident</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((donation) => {
                      const isMoney = String(donation?.donation_type).toLowerCase() === "money";
                      const value = isMoney
                        ? currencyFormatter.format(Number(donation?.amount || 0))
                        : `${donation?.item_name || "Item"} x ${donation?.quantity || 0}`;

                      return (
                        <tr key={donation.id} className="border-t border-[#eaf0f5]">
                          <td className="px-5 py-3 text-[var(--text)]">{formatDateTime(donation?.created_at)}</td>
                          <td className="px-5 py-3 text-[var(--text)]">{donation?.donor_name || "Anonymous"}</td>
                          <td className="px-5 py-3 capitalize text-[var(--text)]">{donation?.donation_type || "N/A"}</td>
                          <td className="px-5 py-3 text-[var(--text)]">{value}</td>
                          <td className="px-5 py-3 text-[var(--text)]">{donation?.incident_title || `#${donation?.incident || "N/A"}`}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="mt-6 rounded-3xl border border-[#d4e2eb] bg-white p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} />
              <h2 className="text-lg font-bold text-[var(--text)]">What This Shows</h2>
            </div>
            <p className="mt-3 text-sm text-[var(--text-soft)]">
              This page currently summarizes platform donation activity and how support is distributed across verified incidents.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
