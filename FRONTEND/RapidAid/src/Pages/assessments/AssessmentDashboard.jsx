import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/Axios";
import { parseList } from "../Admin/adminUtils";

const familyDefaults = {
  incident: "",
  head_of_family_name: "",
  contact_number: "",
  address: "",
  total_members: "",
  injured_members: "0",
  deceased_members: "0",
  is_verified: false,
};

const lossDefaults = {
  family: "",
  house_damage: "none",
  estimated_property_loss: "",
  livestock_lost: "0",
  crops_lost: false,
  remarks: "",
};

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
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
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
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        navigate("/login");
        return;
      }
      setError(err?.response?.data?.detail || "Failed to load assessment data.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const verifiedIncidents = incidents.filter((item) => item.status === "verified");

  const createFamily = async (e) => {
    e.preventDefault();
    setFamilyLoading(true);
    setError("");
    setSuccess("");

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
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not create family record.");
    } finally {
      setFamilyLoading(false);
    }
  };

  const createLossAssessment = async (e) => {
    e.preventDefault();
    setLossLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await axiosInstance.post("assessments/loss/add/", {
        ...lossForm,
        estimated_property_loss: Number(lossForm.estimated_property_loss),
        livestock_lost: Number(lossForm.livestock_lost || 0),
      });
      setSuccess(`Loss assessment created. ID: ${res.data?.id}`);
      setLossForm(lossDefaults);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not create loss assessment.");
    } finally {
      setLossLoading(false);
    }
  };

  const lookupLossAssessment = async () => {
    if (!lookupId) return;

    setLookupLoading(true);
    setLossDetail(null);
    setDetailError("");

    try {
      const res = await axiosInstance.get(`assessments/loss/${lookupId}/`);
      setLossDetail(res.data);
    } catch (err) {
      setDetailError(err?.response?.data?.detail || "Assessment not found.");
    } finally {
      setLookupLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <div className="max-w-6xl mx-auto bg-white border rounded-2xl p-8 text-center text-slate-600">
          Loading assessment dashboard...
        </div>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <div className="max-w-3xl mx-auto bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
          You do not have permission to access assessments.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-emerald-600 font-semibold">
            Assessments
          </p>
          <h1 className="text-3xl font-bold text-slate-900 mt-2">Damage Assessment Hub</h1>
          <p className="text-sm text-slate-500 mt-2">
            Record affected families and create loss assessments.
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

        <div className="grid lg:grid-cols-2 gap-4">
          <form onSubmit={createFamily} className="bg-white border rounded-2xl p-5 space-y-3">
            <h2 className="font-semibold text-slate-900">Add Affected Family</h2>
            <select
              value={familyForm.incident}
              onChange={(e) => setFamilyForm((prev) => ({ ...prev, incident: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">Select verified incident</option>
              {verifiedIncidents.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
            <input
              value={familyForm.head_of_family_name}
              onChange={(e) =>
                setFamilyForm((prev) => ({ ...prev, head_of_family_name: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Head of family name"
              required
            />
            <input
              value={familyForm.contact_number}
              onChange={(e) =>
                setFamilyForm((prev) => ({ ...prev, contact_number: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Contact number"
              required
            />
            <input
              value={familyForm.address}
              onChange={(e) => setFamilyForm((prev) => ({ ...prev, address: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Address"
              required
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                min="1"
                value={familyForm.total_members}
                onChange={(e) =>
                  setFamilyForm((prev) => ({ ...prev, total_members: e.target.value }))
                }
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Total"
                required
              />
              <input
                type="number"
                min="0"
                value={familyForm.injured_members}
                onChange={(e) =>
                  setFamilyForm((prev) => ({ ...prev, injured_members: e.target.value }))
                }
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Injured"
              />
              <input
                type="number"
                min="0"
                value={familyForm.deceased_members}
                onChange={(e) =>
                  setFamilyForm((prev) => ({ ...prev, deceased_members: e.target.value }))
                }
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Deceased"
              />
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={familyForm.is_verified}
                onChange={(e) =>
                  setFamilyForm((prev) => ({ ...prev, is_verified: e.target.checked }))
                }
              />
              Family information verified
            </label>
            <button
              type="submit"
              disabled={familyLoading}
              className="bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
            >
              {familyLoading ? "Saving..." : "Add Family"}
            </button>
          </form>

          <form onSubmit={createLossAssessment} className="bg-white border rounded-2xl p-5 space-y-3">
            <h2 className="font-semibold text-slate-900">Create Loss Assessment</h2>
            <select
              value={lossForm.family}
              onChange={(e) => setLossForm((prev) => ({ ...prev, family: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">Select family</option>
              {families.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.head_of_family_name} - Incident #{item.incident}
                </option>
              ))}
            </select>
            <select
              value={lossForm.house_damage}
              onChange={(e) => setLossForm((prev) => ({ ...prev, house_damage: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="none">No Damage</option>
              <option value="partial">Partial Damage</option>
              <option value="full">Fully Damaged</option>
            </select>
            <input
              type="number"
              min="0"
              value={lossForm.estimated_property_loss}
              onChange={(e) =>
                setLossForm((prev) => ({ ...prev, estimated_property_loss: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Estimated property loss"
              required
            />
            <input
              type="number"
              min="0"
              value={lossForm.livestock_lost}
              onChange={(e) =>
                setLossForm((prev) => ({ ...prev, livestock_lost: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Livestock lost"
            />
            <label className="inline-flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={lossForm.crops_lost}
                onChange={(e) => setLossForm((prev) => ({ ...prev, crops_lost: e.target.checked }))}
              />
              Crops lost
            </label>
            <textarea
              rows={2}
              value={lossForm.remarks}
              onChange={(e) => setLossForm((prev) => ({ ...prev, remarks: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Remarks"
            />
            <button
              type="submit"
              disabled={lossLoading}
              className="bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
            >
              {lossLoading ? "Saving..." : "Create Assessment"}
            </button>
          </form>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <h2 className="font-semibold text-slate-900 mb-3">Loss Assessment Lookup</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="number"
              min="1"
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              className="border rounded-lg px-3 py-2 w-full max-w-xs"
              placeholder="Assessment ID"
            />
            <button
              type="button"
              onClick={lookupLossAssessment}
              disabled={lookupLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
            >
              {lookupLoading ? "Searching..." : "Load"}
            </button>
          </div>
          {detailError && <p className="text-sm text-red-600">{detailError}</p>}
          {lossDetail && (
            <div className="text-sm text-slate-700 space-y-1">
              <p>ID: {lossDetail.id}</p>
              <p>Family: {lossDetail.family_name || `#${lossDetail.family}`}</p>
              <p>House Damage: {lossDetail.house_damage}</p>
              <p>Estimated Loss: {lossDetail.estimated_property_loss}</p>
              <p>Livestock Lost: {lossDetail.livestock_lost}</p>
              <p>Crops Lost: {String(lossDetail.crops_lost)}</p>
              <p>Assessed At: {lossDetail.assessed_at || "N/A"}</p>
            </div>
          )}
        </div>

        <div className="bg-white border rounded-2xl divide-y">
          <div className="px-5 py-4">
            <h2 className="font-semibold text-slate-900">Affected Families</h2>
          </div>
          {families.length === 0 && (
            <p className="px-5 py-6 text-sm text-slate-500">No family records found.</p>
          )}
          {families.map((item) => (
            <div key={item.id} className="px-5 py-4">
              <p className="font-semibold text-slate-900">{item.head_of_family_name}</p>
              <p className="text-sm text-slate-500 mt-1">
                Incident #{item.incident} | Members: {item.total_members} | Injured: {item.injured_members} | Deceased: {item.deceased_members}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
