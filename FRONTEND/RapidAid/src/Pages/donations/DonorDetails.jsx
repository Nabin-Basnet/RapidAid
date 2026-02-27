import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/Axios";

const normalizeList = (payload) => {
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload)) return payload;
  return [];
};

export default function DonorDetails() {
  const [donations, setDonations] = useState([]);
  const [incidentMap, setIncidentMap] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/donations/my/").then((res) => setDonations(normalizeList(res.data))).catch(() => {});
    axios.get("/incidents/").then((res) => {
      const rows = normalizeList(res.data);
      const map = rows.reduce((acc, incident) => {
        acc[incident.id] = incident.title;
        return acc;
      }, {});
      setIncidentMap(map);
    }).catch(() => {});
  }, []);

  const grouped = Object.values(
    donations.reduce((acc, d) => {
      const incidentId = d.incident?.id || d.incident;
      const incidentTitle = d.incident?.title || incidentMap[incidentId] || `Incident #${incidentId}`;
      const key = incidentId || "unknown";

      if (!acc[key]) acc[key] = { incidentId, incidentTitle, groups: {} };
      const tsKey = d.created_at || "unknown-time";
      if (!acc[key].groups[tsKey]) acc[key].groups[tsKey] = [];
      acc[key].groups[tsKey].push(d);
      return acc;
    }, {})
  );

  return (
    <section className="rounded-3xl border border-[#d4e2eb] bg-white p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--text-soft)]">Contribution History</p>
          <h2 className="mt-2 text-2xl font-bold text-[var(--text)]">My Donations</h2>
        </div>
        <button onClick={() => navigate("/donates")} className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white">Donate Now</button>
      </div>

      {grouped.length === 0 ? (
        <p className="text-sm text-[var(--text-soft)]">No donations yet.</p>
      ) : (
        grouped.map((group) => (
          <article key={group.incidentId} className="mb-4 rounded-2xl border border-[#deebf3] bg-[#f8fcff] p-4">
            <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <h3 className="text-lg font-bold text-[var(--text)]">{group.incidentTitle}</h3>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--text-soft)]">
                {Object.values(group.groups).reduce((sum, rows) => sum + rows.length, 0)} donation(s)
              </span>
            </div>

            {Object.entries(group.groups).map(([tsKey, items]) => (
              <div key={tsKey} className="mb-2 rounded-xl border border-[#e4eef5] bg-white p-3">
                <p className="text-xs text-[var(--text-soft)]">
                  {tsKey === "unknown-time" ? "Time not available" : new Date(tsKey).toLocaleString()}
                </p>

                <div className="mt-2 space-y-1 text-sm text-[var(--text)]">
                  {items.map((d) =>
                    d.donation_type === "money" ? (
                      <p key={d.id}>Money: {d.amount}</p>
                    ) : (
                      <p key={d.id}>Item: {d.item_name} ({d.quantity})</p>
                    )
                  )}
                </div>
              </div>
            ))}
          </article>
        ))
      )}
    </section>
  );
}
