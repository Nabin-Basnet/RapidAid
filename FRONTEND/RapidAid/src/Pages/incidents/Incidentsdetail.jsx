import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import axiosInstance from "../../api/Axios";
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
  const [showDamage, setShowDamage] = useState(false);
  const [damageLoading, setDamageLoading] = useState(false);
  const [damageError, setDamageError] = useState("");
  const [damageSummary, setDamageSummary] = useState(null);
  const [damageRows, setDamageRows] = useState([]);

  const token = localStorage.getItem("access");

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/incidents/${id}/`,
          {
            headers: token
              ? { Authorization: `Bearer ${token}` }
              : {},
          }
        );
        setIncident(res.data);
      } catch {
        setError("Failed to load incident");
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

  const formatText = (text) =>
    text?.replace("_", " ").toUpperCase();

  const loadDamageRecords = async () => {
    try {
      setDamageLoading(true);
      setDamageError("");

      const [familyRes, lossRes] = await Promise.all([
        axiosInstance.get("assessments/families/"),
        axiosInstance.get("assessments/loss/"),
      ]);

      const familiesPayload = Array.isArray(familyRes.data?.results)
        ? familyRes.data.results
        : Array.isArray(familyRes.data)
          ? familyRes.data
          : [];

      const lossesPayload = Array.isArray(lossRes.data?.results)
        ? lossRes.data.results
        : Array.isArray(lossRes.data)
          ? lossRes.data
          : [];

      const families = familiesPayload.filter(
        (item) => String(item.incident) === String(id)
      );

      const familyIdSet = new Set(families.map((item) => item.id));
      const losses = lossesPayload.filter((item) => familyIdSet.has(item.family));

      const lossByFamily = losses.reduce((acc, item) => {
        acc[item.family] = item;
        return acc;
      }, {});

      const summary = {
        totalHouseholds: families.length,
        verifiedHouseholds: families.filter((item) => item.is_verified).length,
        totalMembers: families.reduce((sum, item) => sum + Number(item.total_members || 0), 0),
        injuredMembers: families.reduce((sum, item) => sum + Number(item.injured_members || 0), 0),
        deceasedMembers: families.reduce((sum, item) => sum + Number(item.deceased_members || 0), 0),
        estimatedPropertyLoss: losses.reduce(
          (sum, item) => sum + Number(item.estimated_property_loss || 0),
          0
        ),
        livestockLost: losses.reduce((sum, item) => sum + Number(item.livestock_lost || 0), 0),
        cropsAffectedFamilies: losses.filter((item) => item.crops_lost).length,
        fullDamageCount: losses.filter((item) => item.house_damage === "full").length,
        partialDamageCount: losses.filter((item) => item.house_damage === "partial").length,
        noDamageCount: losses.filter((item) => item.house_damage === "none").length,
      };

      const rows = families.map((family) => {
        const loss = lossByFamily[family.id];
        return {
          id: family.id,
          familyName: family.head_of_family_name,
          contact: family.contact_number,
          address: family.address,
          members: family.total_members,
          injured: family.injured_members,
          deceased: family.deceased_members,
          verified: family.is_verified,
          houseDamage: loss?.house_damage || "N/A",
          propertyLoss: loss?.estimated_property_loss || 0,
          livestockLost: loss?.livestock_lost || 0,
          cropsLost: loss?.crops_lost ? "Yes" : "No",
          remarks: loss?.remarks || "-",
        };
      });

      setDamageSummary(summary);
      setDamageRows(rows);
    } catch (err) {
      setDamageError(
        err?.response?.data?.detail || "Failed to load damage/loss records."
      );
    } finally {
      setDamageLoading(false);
    }
  };

  const handleToggleDamage = async () => {
    const next = !showDamage;
    setShowDamage(next);
    if (next && damageRows.length === 0 && !damageLoading) {
      await loadDamageRecords();
    }
  };

  /* ---------------- UI States ---------------- */
  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );

  if (!incident)
    return (
      <div className="h-screen flex items-center justify-center">
        Incident not found
      </div>
    );

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6 my-10">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:underline"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <button
          onClick={handleToggleDamage}
          className="ml-4 px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
        >
          {showDamage ? "Hide Damage & Loss" : "Damage & Loss"}
        </button>

        {/* Header */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">

            <div>
              <h1 className="text-3xl font-bold">
                {incident.title}
              </h1>

              <p className="text-gray-600 mt-1">
                Reported by{" "}
                <span className="font-medium">
                  {incident.reporter_name}
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
                {formatText(incident.status)}
              </span>

              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${severityColor(
                  incident.severity
                )}`}
              >
                {formatText(incident.severity)}
              </span>
            </div>
          </div>

          <p className="mt-5 text-gray-700">
            {incident.description}
          </p>

          {incident.location && (
            <div className="mt-4 flex items-center gap-2 text-gray-600">
              <MapPin size={18} />
              {incident.location}
            </div>
          )}
        </div>

        {/* Timeline */}
        {incident.timeline?.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ShieldCheck size={20} />
              Incident Timeline
            </h2>

            <div className="space-y-4">
              {incident.timeline.map((t) => (
                <div
                  key={t.id}
                  className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded"
                >
                  <div className="flex justify-between">
                    <p className="font-medium">
                      {t.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(t.created_at).toLocaleString()}
                    </p>
                  </div>

                  <p className="text-sm mt-1 flex items-center gap-2">
                    <AlertTriangle size={14} />
                    {t.description}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    By: {t.created_by_name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approved Volunteers */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Approved Volunteers
          </h2>

          {incident.approved_volunteers?.length > 0 ? (
            <div className="space-y-3">
              {incident.approved_volunteers.map((volunteer) => (
                <div
                  key={volunteer.id}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {volunteer.user_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {volunteer.user_email}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      Approved:{" "}
                      {volunteer.approved_at
                        ? new Date(volunteer.approved_at).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>

                  {volunteer.remarks ? (
                    <p className="text-sm text-gray-700 mt-2">
                      Remarks: {volunteer.remarks}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              No approved volunteers yet.
            </p>
          )}
        </div>

        {showDamage && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Damage & Loss Records</h2>

            {damageLoading && (
              <p className="text-sm text-gray-500">Loading damage records...</p>
            )}
            {damageError && (
              <p className="text-sm text-red-600">{damageError}</p>
            )}

            {!damageLoading && !damageError && damageSummary && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Households Affected</p>
                    <p className="text-lg font-bold">{damageSummary.totalHouseholds}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Verified Households</p>
                    <p className="text-lg font-bold">{damageSummary.verifiedHouseholds}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Total Members</p>
                    <p className="text-lg font-bold">{damageSummary.totalMembers}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Injured Members</p>
                    <p className="text-lg font-bold">{damageSummary.injuredMembers}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Deceased Members</p>
                    <p className="text-lg font-bold">{damageSummary.deceasedMembers}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Estimated Property Loss</p>
                    <p className="text-lg font-bold">
                      {Number(damageSummary.estimatedPropertyLoss).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Livestock Lost</p>
                    <p className="text-lg font-bold">{damageSummary.livestockLost}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Crops Affected Families</p>
                    <p className="text-lg font-bold">{damageSummary.cropsAffectedFamilies}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                    <p className="text-xs text-red-700">Full Damage</p>
                    <p className="text-lg font-bold text-red-700">{damageSummary.fullDamageCount}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
                    <p className="text-xs text-yellow-700">Partial Damage</p>
                    <p className="text-lg font-bold text-yellow-700">{damageSummary.partialDamageCount}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                    <p className="text-xs text-green-700">No Damage</p>
                    <p className="text-lg font-bold text-green-700">{damageSummary.noDamageCount}</p>
                  </div>
                </div>

                {damageRows.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No assessment records found for this incident.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-3 py-2 border">Family</th>
                          <th className="text-left px-3 py-2 border">Address</th>
                          <th className="text-left px-3 py-2 border">Members</th>
                          <th className="text-left px-3 py-2 border">Injured</th>
                          <th className="text-left px-3 py-2 border">Deceased</th>
                          <th className="text-left px-3 py-2 border">Damage</th>
                          <th className="text-left px-3 py-2 border">Property Loss</th>
                          <th className="text-left px-3 py-2 border">Livestock</th>
                          <th className="text-left px-3 py-2 border">Crops</th>
                        </tr>
                      </thead>
                      <tbody>
                        {damageRows.map((row) => (
                          <tr key={row.id} className="border-t">
                            <td className="px-3 py-2 border">
                              <p className="font-medium">{row.familyName}</p>
                              <p className="text-xs text-gray-500">{row.contact}</p>
                            </td>
                            <td className="px-3 py-2 border">{row.address}</td>
                            <td className="px-3 py-2 border">{row.members}</td>
                            <td className="px-3 py-2 border">{row.injured}</td>
                            <td className="px-3 py-2 border">{row.deceased}</td>
                            <td className="px-3 py-2 border">{row.houseDamage}</td>
                            <td className="px-3 py-2 border">
                              {Number(row.propertyLoss).toLocaleString()}
                            </td>
                            <td className="px-3 py-2 border">{row.livestockLost}</td>
                            <td className="px-3 py-2 border">{row.cropsLost}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        {/* Media Section */}
{incident.media && incident.media.length > 0 && (
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
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/400x300?text=Image+Not+Found";
                }}
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


      </div>
    </div>
  );
};

export default IncidentDetail;
