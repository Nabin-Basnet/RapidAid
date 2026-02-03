import { useState } from "react";
import axiosInstance from "../../api/Axios"; // update path according to your structure
import { MapPin, Camera } from "lucide-react";

export default function ReportIncidentsPage() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [severity, setSeverity] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const response = await axiosInstance.post("/incidents/report/", {
        title,
        description,
        incident_type: type,
        severity,
        location,
        incident_date: incidentDate,
      });

      const incidentId = response.data?.id;

      if (incidentId && files.length > 0) {
        await Promise.all(
          files.map((file) => {
            const mediaData = new FormData();
            mediaData.append("file", file);
            mediaData.append(
              "media_type",
              file.type.startsWith("video/") ? "video" : "photo"
            );
            return axiosInstance.post(
              `/incidents/media/upload/${incidentId}/`,
              mediaData,
              {
                transformRequest: (data, headers) => {
                  delete headers["Content-Type"];
                  delete headers["content-type"];
                  return data;
                },
              }
            );
          })
        );
      }

      setSuccess("Incident reported successfully!");
      setTitle("");
      setType("");
      setDescription("");
      setLocation("");
      setSeverity("");
      setIncidentDate("");
      setFiles([]);
      console.log("Response:", response.data);
       console.log("Upload error data:", err.response?.data);
      const data = err.response?.data;
      const message =
        data?.detail ||
        data?.file?.[0] ||
        data?.media_type?.[0] ||
        data?.non_field_errors?.[0] ||
        "Something went wrong";
      setError(message);
;
      setError(err.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-2xl space-y-4"
      >
        <h1 className="text-2xl font-semibold text-center">🚨 Report an Incident</h1>
        <p className="text-sm text-gray-500 text-center">
          Provide accurate details to help responders act quickly
        </p>

        <input
          type="text"
          placeholder="Incident title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-lg p-2"
          required
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border rounded-lg p-2"
          required
        >
          <option value="">Select incident type</option>
          <option value="flood">Flood</option>
          <option value="fire">Fire</option>
          <option value="landslide">Landslide</option>
          <option value="earthquake">Earthquake</option>
          <option value="other">Other</option>
        </select>

        <textarea
          placeholder="Describe the incident in detail"
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded-lg p-2"
          required
        />

        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="w-full border rounded-lg p-2"
          required
        >
          <option value="">Select severity</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        <input
          type="date"
          value={incidentDate}
          onChange={(e) => setIncidentDate(e.target.value)}
          className="w-full border rounded-lg p-2"
          required
        />

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Location / Address"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 border rounded-lg p-2"
            required
          />
          <button type="button" className="border rounded-lg p-2">
            <MapPin className="w-5 h-5" />
          </button>
        </div>

        <label className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100">
          <Camera className="w-8 h-8 text-gray-400" />
          <span className="text-sm text-gray-500">Upload photos/videos</span>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {files.length > 0 && (
          <p className="text-xs text-gray-500">{files.length} file(s) selected</p>
        )}

        {success && <p className="text-green-600 text-center">{success}</p>}
        {error && <p className="text-red-600 text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded-xl text-lg hover:bg-blue-700"
        >
          {loading ? "Submitting..." : "Submit Incident Report"}
        </button>
      </form>
    </div>
  );
}
