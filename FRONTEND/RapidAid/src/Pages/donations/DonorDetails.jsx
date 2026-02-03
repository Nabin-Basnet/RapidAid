import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/Axios";

const DonorDetails = () => {
  const [donations, setDonations] = useState([]);
  const navigate = useNavigate();

  const [incidentMap, setIncidentMap] = useState({});

  useEffect(() => {
    axios
      .get("/donations/list/")
      .then((res) => setDonations(res.data))
      .catch((err) => console.error(err));

    axios
      .get("/incidents/")
      .then((res) => {
        const data = Array.isArray(res.data?.results)
          ? res.data.results
          : Array.isArray(res.data)
            ? res.data
            : [];
        const map = data.reduce((acc, incident) => {
          acc[incident.id] = incident.title;
          return acc;
        }, {});
        setIncidentMap(map);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="bg-white/90 backdrop-blur border border-slate-100 p-6 shadow-sm rounded-3xl mt-6">
      {/* Header with Donate Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500 font-semibold">
            History
          </p>
          <h2 className="text-2xl font-bold text-gray-900 mt-2">
            My Donations
          </h2>
        </div>

        <button
          onClick={() => navigate("/donates")}
          className="bg-sky-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-sky-700 transition shadow-sm"
        >
          Donate Now
        </button>
      </div>

      {donations.length === 0 ? (
        <p className="text-gray-500">No donations yet.</p>
      ) : (
        Object.values(
          donations.reduce((acc, d) => {
            const incidentId = d.incident?.id || d.incident;
            const incidentTitle =
              d.incident?.title ||
              incidentMap[incidentId] ||
              `Incident #${incidentId}`;
            const key = incidentId || "unknown";

            if (!acc[key]) {
              acc[key] = {
                incidentId,
                incidentTitle,
                groups: {},
              };
            }

            const tsKey = d.created_at || "unknown-time";
            if (!acc[key].groups[tsKey]) {
              acc[key].groups[tsKey] = [];
            }
            acc[key].groups[tsKey].push(d);
            return acc;
          }, {})
        ).map((group) => (
          <div
            key={group.incidentId}
            className="border border-slate-200/70 p-5 mb-5 rounded-2xl bg-gradient-to-br from-white to-slate-50"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Incident
                </p>
                <p className="text-xl font-semibold text-gray-900 mt-1">
                  {group.incidentTitle}
                </p>
              </div>
              <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {Object.values(group.groups).reduce(
                  (sum, items) => sum + items.length,
                  0
                )} donation(s)
              </span>
            </div>

            {Object.entries(group.groups).map(([tsKey, items]) => (
              <div
                key={tsKey}
                className="border border-slate-200/70 p-4 mb-3 rounded-2xl bg-white"
              >
                <p className="text-xs text-slate-500 uppercase tracking-[0.2em]">
                  {tsKey === "unknown-time"
                    ? "Time not available"
                    : new Date(tsKey).toLocaleString()}
                </p>

                {items.map((d) =>
                  d.donation_type === "money" ? (
                    <p key={d.id} className="mt-2 text-gray-800">
                      <strong>Money:</strong> Rs. {d.amount}
                    </p>
                  ) : null
                )}

                {items.some((d) => d.donation_type === "item") && (
                  <div className="mt-3">
                    <p className="font-semibold text-gray-800">Items</p>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                      {items
                        .filter((d) => d.donation_type === "item")
                        .map((d) => (
                          <div
                            key={d.id}
                            className="text-sm bg-slate-50 border border-slate-200/70 rounded-xl px-3 py-2"
                          >
                            {d.item_name} ({d.quantity})
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default DonorDetails;
