import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../api/Axios";

const getApiErrorMessage = (err, fallback) => {
  const data = err?.response?.data;
  if (!data) return fallback;
  if (typeof data.detail === "string" && data.detail.trim()) return data.detail;

  if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
    return data.non_field_errors[0];
  }

  if (typeof data === "object") {
    for (const value of Object.values(data)) {
      if (Array.isArray(value) && value.length > 0) {
        return String(value[0]);
      }
      if (typeof value === "string" && value.trim()) {
        return value;
      }
    }
  }

  return fallback;
};

const VolunteerForm = () => {
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
        console.error(err);
        setError(
          err.response?.data?.detail || "Failed to load incident details."
        );
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
      await axiosInstance.post("/volunteer/apply/", {
        incident: Number(id),
        remarks: remarks.trim(),
      });
      navigate("/incidents");
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err, "Failed to submit volunteer application."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 px-4 py-10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="h-64 w-64 bg-indigo-200/40 rounded-full blur-3xl -top-16 -left-20 absolute" />
        <div className="h-72 w-72 bg-cyan-200/40 rounded-full blur-3xl -bottom-20 -right-16 absolute" />
      </div>

      <div className="relative w-full max-w-xl bg-white/90 backdrop-blur rounded-3xl shadow-xl p-8 border border-indigo-100">
        <div className="text-center mb-6">
          <p className="text-xs uppercase tracking-[0.25em] text-indigo-600 font-semibold">
            RapidAid
          </p>
          <h2 className="text-3xl font-extrabold text-gray-900 mt-2">
            Volunteer Application
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Apply to support verified incidents in your community.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        {loadingIncident ? (
          <div className="py-8 text-center text-gray-500">
            Loading incident details...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Incident
              </label>
              <input
                type="text"
                value={incident?.title || ""}
                disabled
                className="w-full px-4 py-3 border rounded-xl bg-gray-100 text-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks (Optional)
              </label>
              <textarea
                rows="4"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add any notes about your availability or skills."
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm"
            >
              {submitting ? "Submitting..." : "Apply as Volunteer"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default VolunteerForm;
