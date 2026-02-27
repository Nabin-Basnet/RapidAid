import { useState } from "react";
import { Camera, Siren, MapPin } from "lucide-react";
import axiosInstance from "../../api/Axios";

const initialForm = {
  title: "",
  type: "",
  description: "",
  location: "",
  severity: "",
  incidentDate: "",
};

export default function ReportIncidentsPage() {
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const response = await axiosInstance.post("/incidents/report/", {
        title: form.title,
        description: form.description,
        incident_type: form.type,
        severity: form.severity,
        location: form.location,
        incident_date: form.incidentDate,
      });

      const incidentId = response.data?.id;
      if (incidentId && files.length > 0) {
        await Promise.all(
          files.map((file) => {
            const mediaData = new FormData();
            mediaData.append("file", file);
            mediaData.append("media_type", file.type.startsWith("video/") ? "video" : "photo");
            return axiosInstance.post(`/incidents/media/upload/${incidentId}/`, mediaData, {
              transformRequest: (data, headers) => {
                delete headers["Content-Type"];
                delete headers["content-type"];
                return data;
              },
            });
          })
        );
      }

      setSuccess("Incident submitted successfully. Thank you for reporting.");
      setForm(initialForm);
      setFiles([]);
    } catch (err) {
      const data = err?.response?.data;
      const message =
        data?.detail ||
        data?.file?.[0] ||
        data?.media_type?.[0] ||
        data?.non_field_errors?.[0] ||
        "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-wrap py-24">
      <div className="grid gap-5 lg:grid-cols-[1.1fr_1.5fr]">
        <aside className="rounded-[28px] border border-[#cddde7] bg-[#0f2a3f] p-8 text-white">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]">
            <Siren size={14} />
            Critical Intake
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight">Report An Incident</h1>
          <p className="mt-4 text-sm text-[#c6d6e2]">
            Provide precise details to help response teams validate, prioritize, and act quickly.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-[#d3e0ea]">
            <li>- Include clear location details.</li>
            <li>- Upload photo/video evidence if available.</li>
            <li>- Describe immediate risks and affected area.</li>
          </ul>
        </aside>

        <form onSubmit={handleSubmit} className="rounded-[28px] border border-[#d4e2eb] bg-white p-7 md:p-8">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Incident Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="w-full rounded-xl border border-[#cfdee8] px-4 py-3 outline-none transition focus:border-[var(--brand)]"
                placeholder="Short headline of the emergency"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Incident Type</label>
              <select
                value={form.type}
                onChange={(e) => handleChange("type", e.target.value)}
                className="w-full rounded-xl border border-[#cfdee8] px-4 py-3 outline-none transition focus:border-[var(--brand)]"
                required
              >
                <option value="">Select type</option>
                <option value="flood">Flood</option>
                <option value="fire">Fire</option>
                <option value="landslide">Landslide</option>
                <option value="earthquake">Earthquake</option>
                <option value="accident">Accident</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Severity</label>
              <select
                value={form.severity}
                onChange={(e) => handleChange("severity", e.target.value)}
                className="w-full rounded-xl border border-[#cfdee8] px-4 py-3 outline-none transition focus:border-[var(--brand)]"
                required
              >
                <option value="">Select severity</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Description</label>
              <textarea
                rows={5}
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full rounded-xl border border-[#cfdee8] px-4 py-3 outline-none transition focus:border-[var(--brand)]"
                placeholder="What happened, who is affected, and what support is immediately needed?"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 text-[var(--text-soft)]" size={16} />
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  className="w-full rounded-xl border border-[#cfdee8] py-3 pl-9 pr-3 outline-none transition focus:border-[var(--brand)]"
                  placeholder="Address or landmark"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Incident Date</label>
              <input
                type="date"
                value={form.incidentDate}
                onChange={(e) => handleChange("incidentDate", e.target.value)}
                className="w-full rounded-xl border border-[#cfdee8] px-4 py-3 outline-none transition focus:border-[var(--brand)]"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Media Evidence</label>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#b7cedf] bg-[#f7fbff] px-4 py-3 text-sm font-semibold text-[var(--text-soft)] transition hover:border-[var(--brand)]">
                <Camera size={16} />
                Upload photos/videos
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => setFiles([...(e.target.files || [])])}
                />
              </label>
            </div>
          </div>

          {files.length > 0 && (
            <p className="mt-4 text-sm text-[var(--text-soft)]">{files.length} file(s) selected</p>
          )}
          {success && <p className="mt-4 rounded-xl bg-[#ecfff7] px-3 py-2 text-sm text-[#0f7a5e]">{success}</p>}
          {error && <p className="mt-4 rounded-xl bg-[#fff1f1] px-3 py-2 text-sm text-[#b42318]">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-xl bg-[var(--brand)] py-3 text-sm font-bold text-white transition hover:bg-[var(--brand-strong)] disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit Incident Report"}
          </button>
        </form>
      </div>
    </div>
  );
}
