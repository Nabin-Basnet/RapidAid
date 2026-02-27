import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CalendarClock, MapPin, User, ArrowRight, HeartHandshake } from "lucide-react";
import axiosInstance from "../../api/Axios";

const normalizeList = (payload) => {
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload)) return payload;
  return [];
};

const formatDate = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString();
};

const severityTone = (severity) => {
  const s = String(severity || "").toLowerCase();
  if (s === "critical") return "bg-[#fff1f1] text-[#b42318] border-[#fecaca]";
  if (s === "high") return "bg-[#fff7ed] text-[#c2410c] border-[#fed7aa]";
  if (s === "medium") return "bg-[#fffbeb] text-[#b45309] border-[#fde68a]";
  return "bg-[#ecfff7] text-[#0f7a5e] border-[#a7f3d0]";
};

export default function Incidents() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadIncidents = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axiosInstance.get("/incidents/");
        const rows = normalizeList(res.data).filter((item) => item.status === "verified");
        setIncidents(rows);
      } catch (err) {
        setError(err?.response?.data?.detail || "Failed to load verified incidents.");
      } finally {
        setLoading(false);
      }
    };
    loadIncidents();
  }, []);

  const quickStats = useMemo(() => {
    const critical = incidents.filter((item) => item.severity === "critical").length;
    const high = incidents.filter((item) => item.severity === "high").length;
    return {
      total: incidents.length,
      critical,
      high,
    };
  }, [incidents]);

  const handleDonate = (id) => {
    const hasDonor = localStorage.getItem("has_donor") === "true";
    navigate(hasDonor ? `/donates?incident=${id}` : "/doner");
  };

  if (loading) {
    return (
      <div className="section-wrap min-h-screen pt-28">
        <div className="glass-card rounded-3xl p-10 text-center">
          <p className="text-sm font-semibold text-[var(--text-soft)]">Loading verified incidents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section-wrap min-h-screen pt-28">
        <div className="rounded-3xl border border-[#fecaca] bg-[#fff1f1] p-8 text-[#b42318]">{error}</div>
      </div>
    );
  }

  return (
    <div className="section-wrap pb-12 pt-24">
      <div className="glass-card fade-in-up rounded-[28px] border border-[#d5e2eb] p-7 md:p-9">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#bde9e1] bg-[#ecfffb] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand)]">
              <AlertTriangle size={14} />
              Verified Incidents
            </p>
            <h1 className="mt-4 text-4xl font-extrabold text-[var(--text)]">Live Incident Board</h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--text-soft)]">
              Publicly verified emergency reports with response-ready context.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-[#d4e2eb] bg-white p-3 text-center">
            <div>
              <p className="text-xs text-[var(--text-soft)]">Total</p>
              <p className="text-xl font-bold text-[var(--text)]">{quickStats.total}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-soft)]">High</p>
              <p className="text-xl font-bold text-[#c2410c]">{quickStats.high}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-soft)]">Critical</p>
              <p className="text-xl font-bold text-[#b42318]">{quickStats.critical}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {incidents.length === 0 && (
          <div className="rounded-3xl border border-[#d5e2eb] bg-white p-12 text-center">
            <h3 className="text-2xl font-bold text-[var(--text)]">No verified incidents right now</h3>
            <p className="mt-2 text-sm text-[var(--text-soft)]">Once an incident is verified by admins, it will appear here.</p>
          </div>
        )}

        {incidents.map((incident, i) => (
          <article
            key={incident.id}
            className="fade-in-up rounded-3xl border border-[#d5e2eb] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#e8fffa] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">
                    Verified
                  </span>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${severityTone(incident.severity)}`}>
                    {incident.severity || "unknown"} severity
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-[var(--text)]">{incident.title}</h2>
                <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-soft)]">
                  <span className="inline-flex items-center gap-1"><MapPin size={14} />{incident.location || "Location unavailable"}</span>
                  <span className="inline-flex items-center gap-1"><CalendarClock size={14} />{formatDate(incident.created_at)}</span>
                  <span className="inline-flex items-center gap-1"><User size={14} />{incident.reporter_name || "Unknown reporter"}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => navigate(`/incidents/${incident.id}`)}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#cfdde7] bg-white px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--brand)]"
                >
                  View Details
                  <ArrowRight size={14} />
                </button>
                <button
                  onClick={() => handleDonate(incident.id)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-strong)]"
                >
                  <HeartHandshake size={14} />
                  Donate
                </button>
                <button
                  onClick={() => navigate(`/volunteer/apply/${incident.id}`)}
                  className="rounded-xl bg-[#0f2a3f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0b2233]"
                >
                  Volunteer
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
