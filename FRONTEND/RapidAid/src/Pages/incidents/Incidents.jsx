import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Incidents = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchIncidents = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("access");
        const res = await axios.get(
          "http://127.0.0.1:8000/api/incidents/incidents/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        let data = [];
        if (res.data.results && Array.isArray(res.data.results)) {
          data = res.data.results;
        } else if (Array.isArray(res.data)) {
          data = res.data;
        }

        // Logic Change: Filter only "verified" incidents
        const verifiedOnly = data.filter(
          (incident) => incident.status === "verified"
        );
        setIncidents(verifiedOnly);
        
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load incidents");
      } finally {
        setLoading(false);
      }
    };
    fetchIncidents();
  }, []);

  const handleDonate = (incidentId) => {
    const donorId = localStorage.getItem("donor_id");
    donorId ? navigate(`/donate?incident=${incidentId}`) : navigate("/donor/register");
  };

  const handleVolunteerApply = (incidentId) => {
    navigate(`/volunteer/apply/${incidentId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-500 font-medium">Loading verified reports...</p>
      </div>
    );
  }

  return (
    // Added pt-12 (Padding Top) to provide margin at the top of the page
    <div className="min-h-screen bg-[#f8fafc] pt-12 pb-20">
      
      {/* HEADER SECTION */}
      <div className="max-w-6xl mx-auto px-6 mb-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between border-b border-gray-200 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">Verified Only</span>
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Active Incidents
            </h1>
            <p className="text-lg text-gray-500 mt-2">
              Browse officially verified disasters requiring immediate assistance.
            </p>
          </div>
          <div className="mt-4 md:mt-0 text-sm font-medium text-gray-400">
            Showing {incidents.length} verified reports
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        {incidents.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">All clear!</h3>
            <p className="text-gray-500 mt-2">There are currently no incidents marked as "verified".</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all duration-300 overflow-hidden"
              >
                <div className="p-6 md:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          {incident.status_display || "Verified"}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm font-medium text-gray-600 italic">
                           {incident.incident_type_display || incident.incident_type}
                        </span>
                      </div>

                      <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {incident.title}
                      </h2>

                      <div className="flex flex-wrap items-center gap-y-2 gap-x-6 mt-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          {incident.created_at ? new Date(incident.created_at).toLocaleDateString() : "N/A"}
                        </div>
                        {incident.reporter_name && (
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            Reported by <span className="font-medium text-gray-700">{incident.reporter_name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                      <button
                        onClick={() => navigate(`/incidents/${incident.id}`)}
                        className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                      >
                        View Details
                      </button>
                      
                      <button
                        onClick={() => handleDonate(incident.id)}
                        className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-2"
                      >
                        Donate
                      </button>

                      <button
                        onClick={() => handleVolunteerApply(incident.id)}
                        className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2"
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