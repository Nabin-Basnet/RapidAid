import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScrollText } from "lucide-react";
import axiosInstance from "../../api/Axios";
import { parseList } from "../Admin/adminUtils";

const newEntryDefaults = { module: "incidents", reference_id: "", action: "updated", old_data: "", new_data: "", note: "" };

const parseJsonField = (value) => {
  if (!value.trim()) return null;
  try { return JSON.parse(value); }
  catch { return "__INVALID_JSON__"; }
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
    } finally { setLoading(false); }
  }, [navigate]);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError(""); setSuccess("");

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
      setError(err?.response?.data?.detail || (typeof err?.response?.data === "object" ? JSON.stringify(err.response.data) : "Could not create ledger entry."));
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="section-wrap min-h-screen pt-28"><div className="rounded-3xl border border-[#d4e2eb] bg-white p-8 text-sm text-[var(--text-soft)]">Loading ledger...</div></div>;

  return (
    <div className="section-wrap pb-12 pt-24 space-y-5">
      <section className="rounded-[28px] border border-[#cddde7] bg-[#0f2a3f] p-7 text-white md:p-9">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]"><ScrollText size={14} />Ledger</p>
        <h1 className="mt-4 text-4xl font-extrabold">Audit Trail</h1>
      </section>

      {error && <p className="rounded-xl bg-[#fff1f1] px-3 py-2 text-sm text-[#b42318]">{error}</p>}
      {success && <p className="rounded-xl bg-[#ecfff7] px-3 py-2 text-sm text-[#0f7a5e]">{success}</p>}

      <form onSubmit={handleSubmit} className="rounded-3xl border border-[#d4e2eb] bg-white p-5 space-y-3">
        <h2 className="text-lg font-bold">Create Entry</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <input value={form.module} onChange={(e) => setForm((p) => ({ ...p, module: e.target.value }))} className="rounded-xl border border-[#cfdee8] px-3 py-2" placeholder="Module" required />
          <input type="number" min="1" value={form.reference_id} onChange={(e) => setForm((p) => ({ ...p, reference_id: e.target.value }))} className="rounded-xl border border-[#cfdee8] px-3 py-2" placeholder="Reference ID" required />
          <select value={form.action} onChange={(e) => setForm((p) => ({ ...p, action: e.target.value }))} className="rounded-xl border border-[#cfdee8] px-3 py-2">
            <option value="created">created</option><option value="updated">updated</option><option value="deleted">deleted</option>
          </select>
        </div>
        <textarea rows={3} value={form.old_data} onChange={(e) => setForm((p) => ({ ...p, old_data: e.target.value }))} className="w-full rounded-xl border border-[#cfdee8] px-3 py-2 font-mono text-sm" placeholder='Old JSON data' />
        <textarea rows={3} value={form.new_data} onChange={(e) => setForm((p) => ({ ...p, new_data: e.target.value }))} className="w-full rounded-xl border border-[#cfdee8] px-3 py-2 font-mono text-sm" placeholder='New JSON data' />
        <input value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} className="w-full rounded-xl border border-[#cfdee8] px-3 py-2" placeholder="Note" />
        <button type="submit" disabled={submitting} className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{submitting ? "Creating..." : "Create Ledger Entry"}</button>
      </form>

      <section className="overflow-x-auto rounded-3xl border border-[#d4e2eb] bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#f8fcff] text-[var(--text-soft)]">
            <tr>
              <th className="px-4 py-3 text-left">Time</th><th className="px-4 py-3 text-left">Module</th><th className="px-4 py-3 text-left">Ref</th><th className="px-4 py-3 text-left">Action</th><th className="px-4 py-3 text-left">By</th><th className="px-4 py-3 text-left">Note</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && <tr><td className="px-4 py-4 text-[var(--text-soft)]" colSpan={6}>No ledger entries found.</td></tr>}
            {entries.map((entry) => (
              <tr key={entry.id} className="border-t border-[#eaf0f5]">
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
      </section>
    </div>
  );
}
