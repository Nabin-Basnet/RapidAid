import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

const API_BASE = "http://127.0.0.1:8000";

const IncidentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access");

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${API_BASE}/api/incidents/incidents/${id}/`,
          {
            headers: token
              ? { Authorization: `Bearer ${token}` }
              : {},
          }
        );
        setIncident(res.data);
      } catch (err) {
        setError(
          err.response?.data?.detail || "Failed to load incident"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchIncident();
  }, [id, token]);

  /* ---------------- Badge helpers ---------------- */
  const statusColor = (status) => {
    const map = {
      reported: "bg-yellow-100 text-yellow-800",
      verified: "bg-blue-100 text-blue-800",
      in_rescue: "bg-indigo-100 text-indigo-800",
      resolved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return map[status] || "bg-gray-100 text-gray-800";
  };

  const severityColor = (severity) => {
    const map = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    };
    return map[severity] || "bg-gray-100 text-gray-800";
  };

  /* ---------------- UI States ---------------- */
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-600 text-lg">
        Loading incident details…
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center text-red-600 text-lg">
        {error}
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-600 text-lg">
        Incident not found
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:underline"
        >
          <ArrowLeft size={18} /> Back to Incidents
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                {incident.title}
              </h1>

              <p className="text-gray-600 mt-1">
                Reported by{" "}
                <span className="font-medium">
                  {incident.reporter_name || "N/A"}
                </span>
              </p>

              <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                <Calendar size={16} />
                {new Date(incident.created_at).toLocaleString()}
              </div>
            </div>

            <div className="flex gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor(
                  incident.status
                )}`}
              >
                {incident.status_display}
              </span>

              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${severityColor(
                  incident.severity
                )}`}
              >
                {incident.severity_display}
              </span>
            </div>
          </div>

          <p className="mt-5 text-gray-700 leading-relaxed">
            {incident.description}
          </p>

          {incident.latitude && incident.longitude && (
            <div className="mt-4 flex items-center gap-2 text-gray-600">
              <MapPin size={18} />
              {incident.latitude}, {incident.longitude}
            </div>
          )}
        </div>

        {/* Media Section */}
        {incident.media?.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Incident Media
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {incident.media.map((m) => {
                const mediaUrl = m.file.startsWith("http")
                  ? m.file
                  : `${API_BASE}${m.file}`;

                return (
                  <div
                    key={m.id}
                    className="rounded-lg overflow-hidden border"
                  >
                    {m.media_type === "photo" ? (
                      <img
                        src={mediaUrl}
                        alt="Incident"
                        className="w-full h-56 object-cover"
                      />
                    ) : (
                      <video
                        src={mediaUrl}
                        controls
                        className="w-full h-56 object-cover"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Verification Timeline */}
        {incident.verifications?.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ShieldCheck size={20} />
              Verification History
            </h2>

            <div className="space-y-4">
              {incident.verifications.map((v) => (
                <div
                  key={v.id}
                  className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded"
                >
                  <div className="flex justify-between">
                    <p className="font-medium">
                      {v.verifier_name || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(v.created_at).toLocaleString()}
                    </p>
                  </div>

                  <p className="text-sm mt-1 flex items-center gap-2">
                    <AlertTriangle size={14} />
                    {v.status}
                  </p>

                  {v.remarks && (
                    <p className="text-gray-600 mt-1">
                      {v.remarks}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default IncidentDetail;
