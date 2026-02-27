import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardCheck } from "lucide-react";
import axiosInstance from "../../api/Axios";
import { parseList } from "../Admin/adminUtils";

const familyDefaults = { incident: "", head_of_family_name: "", contact_number: "", address: "", total_members: "", injured_members: "0", deceased_members: "0", is_verified: false };
const lossDefaults = { family: "", house_damage: "none", estimated_property_loss: "", livestock_lost: "0", crops_lost: false, remarks: "" };

export default function AssessmentDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [families, setFamilies] = useState([]);
  const [incidents, setIncidents] = useState([]);

  const [familyForm, setFamilyForm] = useState(familyDefaults);
  const [lossForm, setLossForm] = useState(lossDefaults);
  const [lookupId, setLookupId] = useState("");
  const [lossDetail, setLossDetail] = useState(null);
  const [detailError, setDetailError] = useState("");
  const [familyLoading, setFamilyLoading] = useState(false);
  const [lossLoading, setLossLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  }, []);

  const canAccess = ["admin", "assessment_team"].includes(user?.role);

  const loadData = useCallback(async () => {
    try {
      setError("");
      const [familiesRes, incidentsRes] = await Promise.all([
        axiosInstance.get("assessments/families/"),
        axiosInstance.get("incidents/"),
      ]);
      setFamilies(parseList(familiesRes.data));
      setIncidents(parseList(incidentsRes.data));
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        navigate("/login");
        return;
      }
      setError(err?.response?.data?.detail || "Failed to load assessment data.");
    } finally { setLoading(false); }
  }, [navigate]);

  useEffect(() => { loadData(); }, [loadData]);

  const verifiedIncidents = incidents.filter((item) => item.status === "verified");

  const createFamily = async (e) => {
    e.preventDefault();
    setFamilyLoading(true); setError(""); setSuccess("");
    try {
      await axiosInstance.post("assessments/families/add/", {
        ...familyForm,
        total_members: Number(familyForm.total_members),
        injured_members: Number(familyForm.injured_members || 0),
        deceased_members: Number(familyForm.deceased_members || 0),
      });
      setSuccess("Affected family added.");
      setFamilyForm(familyDefaults);
      await loadData();
    } catch (err) { setError(err?.response?.data?.detail || "Could not create family record."); }
    finally { setFamilyLoading(false); }
  };

  const createLossAssessment = async (e) => {
    e.preventDefault();
    setLossLoading(true); setError(""); setSuccess("");
    try {
      const res = await axiosInstance.post("assessments/loss/add/", {
        ...lossForm,
        estimated_property_loss: Number(lossForm.estimated_property_loss),
        livestock_lost: Number(lossForm.livestock_lost || 0),
      });
      setSuccess(`Loss assessment created. ID: ${res.data?.id}`);
      setLossForm(lossDefaults);
      await loadData();
    } catch (err) { setError(err?.response?.data?.detail || "Could not create loss assessment."); }
    finally { setLossLoading(false); }
  };

  const lookupLossAssessment = async () => {
    if (!lookupId) return;
    setLookupLoading(true); setLossDetail(null); setDetailError("");
    try {
      const res = await axiosInstance.get(`assessments/loss/${lookupId}/`);
      setLossDetail(res.data);
    } catch (err) { setDetailError(err?.response?.data?.detail || "Assessment not found."); }
    finally { setLookupLoading(false); }
  };

  if (loading) return <div className="section-wrap min-h-screen pt-28"><div className="rounded-3xl border border-[#d4e2eb] bg-white p-8 text-sm text-[var(--text-soft)]">Loading assessment dashboard...</div></div>;
  if (!canAccess) return <div className="section-wrap min-h-screen pt-28"><div className="rounded-3xl border border-[#fecaca] bg-[#fff1f1] p-6 text-sm text-[#b42318]">You do not have permission to access assessments.</div></div>;

  return (
    <div className="section-wrap pb-12 pt-24 space-y-5">
      <section className="rounded-[28px] border border-[#cddde7] bg-[#0f2a3f] p-7 text-white md:p-9">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]"><ClipboardCheck size={14} />Assessments</p>
        <h1 className="mt-4 text-4xl font-extrabold">Damage Assessment Hub</h1>
      </section>

      {error && <p className="rounded-xl bg-[#fff1f1] px-3 py-2 text-sm text-[#b42318]">{error}</p>}
      {success && <p className="rounded-xl bg-[#ecfff7] px-3 py-2 text-sm text-[#0f7a5e]">{success}</p>}

      <div className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={createFamily} className="rounded-3xl border border-[#d4e2eb] bg-white p-5 space-y-3">
          <h2 className="text-lg font-bold">Add Affected Family</h2>
          <select value={familyForm.incident} onChange={(e) => setFamilyForm((p) => ({ ...p, incident: e.target.value }))} className="w-full rounded-xl border border-[#cfdee8] px-3 py-2" required>
            <option value="">Select verified incident</option>
            {verifiedIncidents.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
          <input value={familyForm.head_of_family_name} onChange={(e) => setFamilyForm((p) => ({ ...p, head_of_family_name: e.target.value }))} className="w-full rounded-xl border border-[#cfdee8] px-3 py-2" placeholder="Head of family name" required />
          <input value={familyForm.contact_number} onChange={(e) => setFamilyForm((p) => ({ ...p, contact_number: e.target.value }))} className="w-full rounded-xl border border-[#cfdee8] px-3 py-2" placeholder="Contact number" required />
          <input value={familyForm.address} onChange={(e) => setFamilyForm((p) => ({ ...p, address: e.target.value }))} className="w-full rounded-xl border border-[#cfdee8] px-3 py-2" placeholder="Address" required />
          <div className="grid grid-cols-3 gap-2">
            <input type="number" min="1" value={familyForm.total_members} onChange={(e) => setFamilyForm((p) => ({ ...p, total_members: e.target.value }))} className="rounded-xl border border-[#cfdee8] px-3 py-2" placeholder="Total" required />
            <input type="number" min="0" value={familyForm.injured_members} onChange={(e) => setFamilyForm((p) => ({ ...p, injured_members: e.target.value }))} className="rounded-xl border border-[#cfdee8] px-3 py-2" placeholder="Injured" />
            <input type="number" min="0" value={familyForm.deceased_members} onChange={(e) => setFamilyForm((p) => ({ ...p, deceased_members: e.target.value }))} className="rounded-xl border border-[#cfdee8] px-3 py-2" placeholder="Deceased" />
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-[var(--text-soft)]"><input type="checkbox" checked={familyForm.is_verified} onChange={(e) => setFamilyForm((p) => ({ ...p, is_verified: e.target.checked }))} />Family info verified</label>
          <button type="submit" disabled={familyLoading} className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{familyLoading ? "Saving..." : "Add Family"}</button>
        </form>

        <form onSubmit={createLossAssessment} className="rounded-3xl border border-[#d4e2eb] bg-white p-5 space-y-3">
          <h2 className="text-lg font-bold">Create Loss Assessment</h2>
          <select value={lossForm.family} onChange={(e) => setLossForm((p) => ({ ...p, family: e.target.value }))} className="w-full rounded-xl border border-[#cfdee8] px-3 py-2" required>
            <option value="">Select family</option>
            {families.map((item) => <option key={item.id} value={item.id}>{item.head_of_family_name} - Incident #{item.incident}</option>)}
          </select>
          <select value={lossForm.house_damage} onChange={(e) => setLossForm((p) => ({ ...p, house_damage: e.target.value }))} className="w-full rounded-xl border border-[#cfdee8] px-3 py-2">
            <option value="none">No Damage</option><option value="partial">Partial Damage</option><option value="full">Fully Damaged</option>
          </select>
          <input type="number" min="0" value={lossForm.estimated_property_loss} onChange={(e) => setLossForm((p) => ({ ...p, estimated_property_loss: e.target.value }))} className="w-full rounded-xl border border-[#cfdee8] px-3 py-2" placeholder="Estimated property loss" required />
          <input type="number" min="0" value={lossForm.livestock_lost} onChange={(e) => setLossForm((p) => ({ ...p, livestock_lost: e.target.value }))} className="w-full rounded-xl border border-[#cfdee8] px-3 py-2" placeholder="Livestock lost" />
          <label className="inline-flex items-center gap-2 text-sm text-[var(--text-soft)]"><input type="checkbox" checked={lossForm.crops_lost} onChange={(e) => setLossForm((p) => ({ ...p, crops_lost: e.target.checked }))} />Crops lost</label>
          <textarea rows={2} value={lossForm.remarks} onChange={(e) => setLossForm((p) => ({ ...p, remarks: e.target.value }))} className="w-full rounded-xl border border-[#cfdee8] px-3 py-2" placeholder="Remarks" />
          <button type="submit" disabled={lossLoading} className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{lossLoading ? "Saving..." : "Create Assessment"}</button>
        </form>
      </div>

      <section className="rounded-3xl border border-[#d4e2eb] bg-white p-5">
        <h2 className="text-lg font-bold">Loss Assessment Lookup</h2>
        <div className="mt-3 flex gap-2">
          <input type="number" min="1" value={lookupId} onChange={(e) => setLookupId(e.target.value)} className="w-full max-w-xs rounded-xl border border-[#cfdee8] px-3 py-2" placeholder="Assessment ID" />
          <button type="button" onClick={lookupLossAssessment} disabled={lookupLoading} className="rounded-xl bg-[#1757b0] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{lookupLoading ? "Searching..." : "Load"}</button>
        </div>
        {detailError && <p className="mt-3 text-sm text-[#b42318]">{detailError}</p>}
        {lossDetail && <div className="mt-3 text-sm text-[var(--text)] space-y-1"><p>ID: {lossDetail.id}</p><p>Family: {lossDetail.family_name || `#${lossDetail.family}`}</p><p>House Damage: {lossDetail.house_damage}</p><p>Estimated Loss: {lossDetail.estimated_property_loss}</p></div>}
      </section>

      <section className="rounded-3xl border border-[#d4e2eb] bg-white">
        <div className="border-b border-[#e7eff5] px-5 py-4"><h2 className="text-lg font-bold">Affected Families</h2></div>
        {families.length === 0 && <p className="px-5 py-6 text-sm text-[var(--text-soft)]">No family records found.</p>}
        {families.map((item) => (
          <div key={item.id} className="border-t border-[#ecf2f7] px-5 py-4">
            <p className="font-semibold text-[var(--text)]">{item.head_of_family_name}</p>
            <p className="text-sm text-[var(--text-soft)]">Incident #{item.incident} | Members: {item.total_members} | Injured: {item.injured_members} | Deceased: {item.deceased_members}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
