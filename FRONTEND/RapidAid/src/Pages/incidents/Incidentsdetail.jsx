import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarClock,
  MapPin,
  ShieldCheck,
  Users,
  FileBarChart2,
  Images,
} from "lucide-react";
import axios from "axios";
import axiosInstance from "../../api/Axios";

const API_BASE = "http://127.0.0.1:8000";

const statusTone = (status) => {
  const value = String(status || "").toLowerCase();
  if (value === "resolved") return "bg-[#ecfff7] text-[#0f7a5e] border-[#a7f3d0]";
  if (value === "in_rescue") return "bg-[#eef4ff] text-[#1d4ed8] border-[#bfdbfe]";
  if (value === "verified") return "bg-[#ecfffb] text-[var(--brand)] border-[#bde9e1]";
  if (value === "reported") return "bg-[#fffbeb] text-[#b45309] border-[#fde68a]";
  return "bg-[#fff1f1] text-[#b42318] border-[#fecaca]";
};

const severityTone = (severity) => {
  const value = String(severity || "").toLowerCase();
  if (value === "critical") return "bg-[#fff1f1] text-[#b42318] border-[#fecaca]";
  if (value === "high") return "bg-[#fff7ed] text-[#c2410c] border-[#fed7aa]";
  if (value === "medium") return "bg-[#fffbeb] text-[#b45309] border-[#fde68a]";
  return "bg-[#ecfff7] text-[#0f7a5e] border-[#a7f3d0]";
};

const normalizeList = (payload) => {
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload)) return payload;
  return [];
};

export default function IncidentDetail() {
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

  useEffect(() => {
    const loadIncident = async () => {
      try {
        const token = localStorage.getItem("access");
        const res = await axios.get(`${API_BASE}/api/incidents/${id}/`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setIncident(res.data);
      } catch {
        setError("Failed to load incident");
      } finally {
        setLoading(false);
      }
    };
    loadIncident();
  }, [id]);

  const loadDamageRecords = async () => {
    try {
      setDamageLoading(true);
      setDamageError("");
      const [familyRes, lossRes] = await Promise.all([
        axiosInstance.get("assessments/families/"),
        axiosInstance.get("assessments/loss/"),
      ]);

      const families = normalizeList(familyRes.data).filter((item) => String(item.incident) === String(id));
      const lossesPayload = normalizeList(lossRes.data);
      const familyIdSet = new Set(families.map((item) => item.id));
      const losses = lossesPayload.filter((item) => familyIdSet.has(item.family));

      const lossByFamily = losses.reduce((acc, item) => {
        acc[item.family] = item;
        return acc;
      }, {});

      const summary = {
        totalHouseholds: families.length,
        totalMembers: families.reduce((sum, item) => sum + Number(item.total_members || 0), 0),
        injuredMembers: families.reduce((sum, item) => sum + Number(item.injured_members || 0), 0),
        deceasedMembers: families.reduce((sum, item) => sum + Number(item.deceased_members || 0), 0),
        estimatedPropertyLoss: losses.reduce((sum, item) => sum + Number(item.estimated_property_loss || 0), 0),
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
          houseDamage: loss?.house_damage || "N/A",
          propertyLoss: loss?.estimated_property_loss || 0,
          livestockLost: loss?.livestock_lost || 0,
          cropsLost: loss?.crops_lost ? "Yes" : "No",
        };
      });

      setDamageSummary(summary);
      setDamageRows(rows);
    } catch (err) {
      setDamageError(err?.response?.data?.detail || "Failed to load damage/loss records.");
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

  if (loading) {
    return (
      <div className="section-wrap min-h-screen pt-28">
        <div className="rounded-3xl border border-[#d4e2eb] bg-white p-8 text-sm text-[var(--text-soft)]">
          Loading incident details...
        </div>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="section-wrap min-h-screen pt-28">
        <div className="rounded-3xl border border-[#fecaca] bg-[#fff1f1] p-8 text-sm text-[#b42318]">
          {error || "Incident not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="section-wrap space-y-5 pb-12 pt-24">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-xl border border-[#d2e0ea] bg-white px-4 py-2 text-sm font-semibold text-[var(--text)]"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <button
          onClick={handleToggleDamage}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-strong)]"
        >
          <FileBarChart2 size={14} />
          {showDamage ? "Hide Damage Data" : "Show Damage Data"}
        </button>
      </div>

      <section className="rounded-[28px] border border-[#d3e2eb] bg-white p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-[var(--text)]">{incident.title}</h1>
            <p className="mt-2 text-sm text-[var(--text-soft)]">{incident.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[var(--text-soft)]">
              <span className="inline-flex items-center gap-1"><MapPin size={14} />{incident.location || "N/A"}</span>
              <span className="inline-flex items-center gap-1"><CalendarClock size={14} />{new Date(incident.created_at).toLocaleString()}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${statusTone(incident.status)}`}>
              {String(incident.status || "").replace("_", " ")}
            </span>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${severityTone(incident.severity)}`}>
              {incident.severity || "unknown"} severity
            </span>
          </div>
        </div>
      </section>

      {incident.timeline?.length > 0 && (
        <section className="rounded-3xl border border-[#d4e2eb] bg-white p-6">
          <h2 className="mb-4 inline-flex items-center gap-2 text-xl font-bold text-[var(--text)]">
            <ShieldCheck size={18} />
            Timeline
          </h2>
          <div className="space-y-3">
            {incident.timeline.map((entry) => (
              <article key={entry.id} className="rounded-2xl border border-[#e3edf4] bg-[#f8fcff] p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <h3 className="font-semibold text-[var(--text)]">{entry.title}</h3>
                  <p className="text-xs text-[var(--text-soft)]">{new Date(entry.created_at).toLocaleString()}</p>
                </div>
                <p className="mt-2 text-sm text-[var(--text-soft)]">{entry.description}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-[#d4e2eb] bg-white p-6">
        <h2 className="mb-4 inline-flex items-center gap-2 text-xl font-bold text-[var(--text)]">
          <Users size={18} />
          Approved Volunteers
        </h2>
        {incident.approved_volunteers?.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {incident.approved_volunteers.map((volunteer) => (
              <article key={volunteer.id} className="rounded-2xl border border-[#e3edf4] bg-[#f8fcff] p-4">
                <p className="font-semibold text-[var(--text)]">{volunteer.user_name}</p>
                <p className="text-sm text-[var(--text-soft)]">{volunteer.user_email}</p>
                <p className="mt-2 text-xs text-[var(--text-soft)]">
                  Approved: {volunteer.approved_at ? new Date(volunteer.approved_at).toLocaleString() : "N/A"}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-soft)]">No approved volunteers yet.</p>
        )}
      </section>

      {showDamage && (
        <section className="rounded-3xl border border-[#d4e2eb] bg-white p-6">
          <h2 className="mb-4 text-xl font-bold text-[var(--text)]">Damage and Loss Insights</h2>
          {damageLoading && <p className="text-sm text-[var(--text-soft)]">Loading damage records...</p>}
          {damageError && <p className="text-sm text-[#b42318]">{damageError}</p>}

          {!damageLoading && !damageError && damageSummary && (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-xl border border-[#deebf3] bg-[#f8fcff] p-3"><p className="text-xs text-[var(--text-soft)]">Households</p><p className="text-xl font-bold">{damageSummary.totalHouseholds}</p></div>
                <div className="rounded-xl border border-[#deebf3] bg-[#f8fcff] p-3"><p className="text-xs text-[var(--text-soft)]">Members</p><p className="text-xl font-bold">{damageSummary.totalMembers}</p></div>
                <div className="rounded-xl border border-[#deebf3] bg-[#f8fcff] p-3"><p className="text-xs text-[var(--text-soft)]">Injured</p><p className="text-xl font-bold">{damageSummary.injuredMembers}</p></div>
                <div className="rounded-xl border border-[#deebf3] bg-[#f8fcff] p-3"><p className="text-xs text-[var(--text-soft)]">Deceased</p><p className="text-xl font-bold">{damageSummary.deceasedMembers}</p></div>
                <div className="rounded-xl border border-[#deebf3] bg-[#f8fcff] p-3"><p className="text-xs text-[var(--text-soft)]">Property Loss</p><p className="text-xl font-bold">{Number(damageSummary.estimatedPropertyLoss).toLocaleString()}</p></div>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#f8fcff] text-[var(--text-soft)]">
                    <tr>
                      <th className="px-3 py-2 text-left">Family</th>
                      <th className="px-3 py-2 text-left">Address</th>
                      <th className="px-3 py-2 text-left">Members</th>
                      <th className="px-3 py-2 text-left">Injured</th>
                      <th className="px-3 py-2 text-left">Deceased</th>
                      <th className="px-3 py-2 text-left">Damage</th>
                      <th className="px-3 py-2 text-left">Loss</th>
                      <th className="px-3 py-2 text-left">Livestock</th>
                      <th className="px-3 py-2 text-left">Crops</th>
                    </tr>
                  </thead>
                  <tbody>
                    {damageRows.map((row) => (
                      <tr key={row.id} className="border-t border-[#e8f0f6]">
                        <td className="px-3 py-2">
                          <p className="font-semibold text-[var(--text)]">{row.familyName}</p>
                          <p className="text-xs text-[var(--text-soft)]">{row.contact}</p>
                        </td>
                        <td className="px-3 py-2">{row.address}</td>
                        <td className="px-3 py-2">{row.members}</td>
                        <td className="px-3 py-2">{row.injured}</td>
                        <td className="px-3 py-2">{row.deceased}</td>
                        <td className="px-3 py-2">{row.houseDamage}</td>
                        <td className="px-3 py-2">{Number(row.propertyLoss).toLocaleString()}</td>
                        <td className="px-3 py-2">{row.livestockLost}</td>
                        <td className="px-3 py-2">{row.cropsLost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      )}

      {incident.media?.length > 0 && (
        <section className="rounded-3xl border border-[#d4e2eb] bg-white p-6">
          <h2 className="mb-4 inline-flex items-center gap-2 text-xl font-bold text-[var(--text)]">
            <Images size={18} />
            Incident Media
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {incident.media.map((media) => {
              const mediaUrl = media.file.startsWith("http") ? media.file : `${API_BASE}${media.file}`;
              return (
                <div key={media.id} className="overflow-hidden rounded-2xl border border-[#deebf3] bg-[#f8fcff]">
                  {media.media_type === "photo" ? (
                    <img
                      src={mediaUrl}
                      alt="Incident media"
                      className="h-56 w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/400x300?text=Image+Not+Found";
                      }}
                    />
                  ) : (
                    <video src={mediaUrl} controls className="h-56 w-full object-cover" />
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
