import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/Axios";
import { parseList } from "../Admin/adminUtils";

const newEntryDefaults = {
  module: "incidents",
  reference_id: "",
  action: "updated",
  old_data: "",
  new_data: "",
  note: "",
};

const parseJsonField = (value) => {
  if (!value.trim()) return null;
  try {
    return JSON.parse(value);
  } catch {
    return "__INVALID_JSON__";
  }
};

export default function LedgerPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(newEntryDefaults);
  const [submitting, setSubmitting] = useState(false);

  const loadEntries = useCallback(async () => {
    try {
      setError("");
      const res = await axiosInstance.get("ledger/ledger-entries/");
      setEntries(parseList(res.data));
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        navigate("/login");
        return;
      }
      setError(err?.response?.data?.detail || "Failed to load ledger entries.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const oldData = parseJsonField(form.old_data);
    const newData = parseJsonField(form.new_data);

    if (oldData === "__INVALID_JSON__" || newData === "__INVALID_JSON__") {
      setError("Old/New JSON fields must be valid JSON.");
      setSubmitting(false);
      return;
    }

    try {
      await axiosInstance.post("ledger/ledger-entries/", {
        module: form.module,
        reference_id: Number(form.reference_id),
        action: form.action,
        old_data: oldData,
        new_data: newData,
        note: form.note || null,
      });
      setSuccess("Ledger entry created.");
      setForm(newEntryDefaults);
      await loadEntries();
    } catch (err) {
      const detail =
        err?.response?.data?.detail ||
        (typeof err?.response?.data === "object"
          ? JSON.stringify(err.response.data)
          : "Could not create ledger entry.");
      setError(detail);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <div className="max-w-6xl mx-auto bg-white border rounded-2xl p-8 text-center text-slate-600">
          Loading ledger...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-700 font-semibold">
            Ledger
          </p>
          <h1 className="text-3xl font-bold text-slate-900 mt-2">Audit Ledger</h1>
          <p className="text-sm text-slate-500 mt-2">
            Track record-level changes across modules.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-5 space-y-3">
          <h2 className="font-semibold text-slate-900">Create Entry</h2>
          <div className="grid md:grid-cols-3 gap-3">
            <input
              value={form.module}
              onChange={(e) => setForm((prev) => ({ ...prev, module: e.target.value }))}
              className="border rounded-lg px-3 py-2"
              placeholder="Module"
              required
            />
            <input
              type="number"
              min="1"
              value={form.reference_id}
              onChange={(e) => setForm((prev) => ({ ...prev, reference_id: e.target.value }))}
              className="border rounded-lg px-3 py-2"
              placeholder="Reference ID"
              required
            />
            <select
              value={form.action}
              onChange={(e) => setForm((prev) => ({ ...prev, action: e.target.value }))}
              className="border rounded-lg px-3 py-2"
            >
              <option value="created">created</option>
              <option value="updated">updated</option>
              <option value="deleted">deleted</option>
            </select>
          </div>
          <textarea
            rows={3}
            value={form.old_data}
            onChange={(e) => setForm((prev) => ({ ...prev, old_data: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 font-mono text-sm"
            placeholder='Old JSON data (optional), e.g. {"status":"reported"}'
          />
          <textarea
            rows={3}
            value={form.new_data}
            onChange={(e) => setForm((prev) => ({ ...prev, new_data: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 font-mono text-sm"
            placeholder='New JSON data (optional), e.g. {"status":"verified"}'
          />
          <input
            value={form.note}
            onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Note"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create Ledger Entry"}
          </button>
        </form>

        <div className="bg-white border rounded-2xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-4 py-3">Time</th>
                <th className="text-left px-4 py-3">Module</th>
                <th className="text-left px-4 py-3">Ref</th>
                <th className="text-left px-4 py-3">Action</th>
                <th className="text-left px-4 py-3">By</th>
                <th className="text-left px-4 py-3">Note</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-slate-500" colSpan={6}>
                    No ledger entries found.
                  </td>
                </tr>
              )}
              {entries.map((entry) => (
                <tr key={entry.id} className="border-t">
                  <td className="px-4 py-3">{new Date(entry.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3">{entry.module}</td>
                  <td className="px-4 py-3">{entry.reference_id}</td>
                  <td className="px-4 py-3">{entry.action}</td>
                  <td className="px-4 py-3">{entry.changed_by_name || entry.changed_by || "N/A"}</td>
                  <td className="px-4 py-3">{entry.note || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
