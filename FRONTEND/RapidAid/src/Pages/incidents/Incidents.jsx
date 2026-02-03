import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000/api/incidents/";

const Incidents = () => {
  const navigate = useNavigate();

  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access");

      if (!token) {
        navigate("/login");
        return;
      }

      const res = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let data = [];

      // Handle paginated & normal response
      if (res.data?.results && Array.isArray(res.data.results)) {
        data = res.data.results;
      } else if (Array.isArray(res.data)) {
        data = res.data;
      }

      // Filter only VERIFIED
      const verifiedIncidents = data.filter(
        (item) => item.status === "verified"
      );

      setIncidents(verifiedIncidents);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Failed to load verified incidents."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = (id) => {
    const donorId = localStorage.getItem("donor_id");
    donorId
      ? navigate(`/donate?incident=${id}`)
      : navigate("/donor/register");
  };

  const handleVolunteerApply = (id) => {
    navigate(`/volunteer/apply/${id}`);
  };

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-500 font-medium">
          Loading verified incidents...
        </p>
      </div>
    );
  }

  /* ---------------- ERROR ---------------- */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl shadow">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-14 pb-20">

      {/* HEADER */}
      <div className="max-w-6xl mx-auto px-6 mb-10 my-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between border-b border-gray-200 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">
                Verified Only
              </span>
            </div>

            <h1 className="text-4xl font-extrabold text-gray-900">
              Active Incidents
            </h1>

            <p className="text-lg text-gray-500 mt-2">
              Official disaster reports verified by authorities.
            </p>
          </div>

          <div className="mt-4 md:mt-0 text-sm font-medium text-gray-400">
            Showing {incidents.length} incidents
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6">

        {/* EMPTY STATE */}
        {incidents.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border shadow-sm">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-gray-900">
              All Clear!
            </h3>
            <p className="text-gray-500 mt-2">
              No verified incidents available right now.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className="bg-white rounded-2xl border shadow-sm hover:shadow-lg transition"
              >
                <div className="p-6 md:p-8">

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

                    {/* LEFT */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 text-xs font-bold uppercase bg-blue-50 text-blue-700 rounded-full">
                          {incident.status_display || "Verified"}
                        </span>

                        <span className="text-gray-400">•</span>

                        <span className="text-sm font-medium text-gray-600 italic">
                          {incident.incident_type_display ||
                            incident.incident_type}
                        </span>
                      </div>

                      <h2 className="text-2xl font-bold text-gray-900">
                        {incident.title}
                      </h2>

                      <div className="flex flex-wrap items-center gap-6 mt-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          📅
                          {incident.created_at
                            ? new Date(
                                incident.created_at
                              ).toLocaleDateString()
                            : "N/A"}
                        </div>

                        {incident.reporter_name && (
                          <div>
                            👤 Reported by{" "}
                            <span className="font-medium text-gray-700">
                              {incident.reporter_name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-wrap sm:flex-nowrap gap-3">
                      <button
                        onClick={() =>
                          navigate(`/incidents/${incident.id}`)
                        }
                        className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
                      >
                        View Details
                      </button>

                      <button
                        onClick={() =>
                          handleDonate(incident.id)
                        }
                        className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700"
                      >
                        Donate
                      </button>

                      <button
                        onClick={() =>
                          handleVolunteerApply(incident.id)
                        }
                        className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
                      >
                        Volunteer
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Incidents;
