import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HelpingHand } from "lucide-react";
import axiosInstance from "../../api/Axios";

const getApiErrorMessage = (err, fallback) => {
  const data = err?.response?.data;
  if (!data) return fallback;
  if (typeof data.detail === "string" && data.detail.trim()) return data.detail;
  if (Array.isArray(data.non_field_errors) && data.non_field_errors.length) return data.non_field_errors[0];
  if (typeof data === "object") {
    for (const value of Object.values(data)) {
      if (Array.isArray(value) && value.length) return String(value[0]);
      if (typeof value === "string" && value.trim()) return value;
    }
  }
  return fallback;
};

export default function VolunteerForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [incident, setIncident] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [loadingIncident, setLoadingIncident] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchIncident = async () => {
      setLoadingIncident(true);
      setError("");
      try {
        const res = await axiosInstance.get(`/incidents/${id}/`);
        setIncident(res.data);
      } catch (err) {
        setError(err?.response?.data?.detail || "Failed to load incident details.");
      } finally {
        setLoadingIncident(false);
      }
    };

    if (!id) {
      setError("Invalid incident selected.");
      setLoadingIncident(false);
      return;
    }
    fetchIncident();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await axiosInstance.post("/volunteer/apply/", { incident: Number(id), remarks: remarks.trim() });
      navigate("/incidents");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to submit volunteer application."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="section-wrap py-24">
      <div className="mx-auto max-w-2xl rounded-[28px] border border-[#d4e2eb] bg-white p-7 md:p-8">
        <p className="inline-flex items-center gap-2 rounded-full bg-[#ecfffb] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand)]">
          <HelpingHand size={14} />
          Volunteer Application
        </p>
        <h1 className="mt-4 text-3xl font-extrabold text-[var(--text)]">Apply to Help</h1>

        {error && <p className="mt-4 rounded-xl bg-[#fff1f1] px-3 py-2 text-sm text-[#b42318]">{error}</p>}

        {loadingIncident ? (
          <p className="mt-5 text-sm text-[var(--text-soft)]">Loading incident details...</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Incident</label>
              <input type="text" disabled value={incident?.title || ""} className="w-full rounded-xl border border-[#cfdee8] bg-[#f4f8fb] px-4 py-3" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Remarks (optional)</label>
              <textarea rows={4} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Availability, experience, skills..." className="w-full rounded-xl border border-[#cfdee8] px-4 py-3 outline-none focus:border-[var(--brand)]" />
            </div>
            <button type="submit" disabled={submitting} className="w-full rounded-xl bg-[var(--brand)] py-3 text-sm font-bold text-white hover:bg-[var(--brand-strong)] disabled:opacity-60">
              {submitting ? "Submitting..." : "Apply as Volunteer"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
