import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/Axios";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const formatDateTime = (value) => {
  if (!value) {
    return "N/A";
  }
  return new Date(value).toLocaleString();
};

const normalizeList = (payload) => {
  if (Array.isArray(payload?.results)) {
    return payload.results;
  }
  if (Array.isArray(payload)) {
    return payload;
  }
  return [];
};

const Transparency = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTransparencyData = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axiosInstance.get("/donations/list/");
        const donationList = normalizeList(res.data);
        setDonations(donationList);
      } catch (err) {
        const detail =
          err?.response?.data?.detail ||
          "Transparency data could not be loaded right now.";
        setError(detail);
      } finally {
        setLoading(false);
      }
    };

    fetchTransparencyData();
  }, []);

  const metrics = useMemo(() => {
    const totalDonations = donations.length;
    const moneyDonations = donations.filter(
      (entry) => String(entry?.donation_type).toLowerCase() === "money"
    );
    const itemDonations = donations.filter(
      (entry) => String(entry?.donation_type).toLowerCase() === "item"
    );

    const totalAmount = moneyDonations.reduce((sum, donation) => {
      const amount = Number(donation?.amount || 0);
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);

    return {
      totalDonations,
      totalAmount,
      moneyCount: moneyDonations.length,
      itemCount: itemDonations.length,
    };
  }, [donations]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-700 font-semibold">
            Transparency
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2">
            Donation Accountability Dashboard
          </h1>
          <p className="text-sm md:text-base text-slate-600 mt-3 max-w-3xl">
            View donation flow across incidents. Every entry below is pulled
            directly from the live donations API.
          </p>
        </div>

        {loading ? (
          <div className="bg-white border rounded-2xl p-8 shadow-sm text-slate-600">
            Loading transparency data...
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
            <p className="font-semibold">Unable to load transparency data.</p>
            <p className="text-sm mt-2">{error}</p>
            <p className="text-sm mt-2">
              If this is an authentication error,{" "}
              <Link to="/login" className="underline font-medium">
                log in here
              </Link>
              .
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white border rounded-2xl p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Total Donations
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  {metrics.totalDonations}
                </p>
              </div>
              <div className="bg-white border rounded-2xl p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Money Donations
                </p>
                <p className="text-2xl font-bold text-emerald-700 mt-2">
                  {metrics.moneyCount}
                </p>
              </div>
              <div className="bg-white border rounded-2xl p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Item Donations
                </p>
                <p className="text-2xl font-bold text-cyan-700 mt-2">
                  {metrics.itemCount}
                </p>
              </div>
              <div className="bg-white border rounded-2xl p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Total Amount
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  {currencyFormatter.format(metrics.totalAmount)}
                </p>
              </div>
            </div>

            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b bg-slate-50">
                <h2 className="text-lg font-semibold text-slate-800">
                  Recent Donation Entries
                </h2>
              </div>

              {donations.length === 0 ? (
                <div className="p-8 text-slate-500 text-sm">
                  No donation entries found yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="text-left font-semibold px-5 py-3">
                          Date
                        </th>
                        <th className="text-left font-semibold px-5 py-3">
                          Donor
                        </th>
                        <th className="text-left font-semibold px-5 py-3">
                          Type
                        </th>
                        <th className="text-left font-semibold px-5 py-3">
                          Value
                        </th>
                        <th className="text-left font-semibold px-5 py-3">
                          Incident
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {donations.map((donation) => {
                        const isMoney =
                          String(donation?.donation_type).toLowerCase() ===
                          "money";
                        const valueText = isMoney
                          ? currencyFormatter.format(Number(donation?.amount || 0))
                          : `${donation?.item_name || "Item"} x ${
                              donation?.quantity || 0
                            }`;

                        return (
                          <tr key={donation.id} className="border-t border-slate-100">
                            <td className="px-5 py-3 text-slate-700">
                              {formatDateTime(donation?.created_at)}
                            </td>
                            <td className="px-5 py-3 text-slate-700">
                              {donation?.donor_name || "Anonymous"}
                            </td>
                            <td className="px-5 py-3 text-slate-700 capitalize">
                              {donation?.donation_type || "N/A"}
                            </td>
                            <td className="px-5 py-3 text-slate-700">
                              {valueText}
                            </td>
                            <td className="px-5 py-3 text-slate-700">
                              #{donation?.incident || "N/A"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Transparency;
