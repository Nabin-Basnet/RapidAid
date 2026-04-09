import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Gift, HandCoins } from "lucide-react";
import axiosInstance from "../../api/Axios";

const initialItem = { item_name: "", quantity: "" };

export default function DonationForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [incidentId, setIncidentId] = useState(searchParams.get("incident") || "");
  const [incidents, setIncidents] = useState([]);
  const [donationType, setDonationType] = useState("money");
  const [amount, setAmount] = useState("");
  const [itemDraft, setItemDraft] = useState(initialItem);
  const [items, setItems] = useState([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const hasDonor = localStorage.getItem("has_donor") === "true";
    if (!hasDonor) {
      navigate("/doner");
      return;
    }

    const fetchIncidents = async () => {
      try {
        const res = await axiosInstance.get("/incidents/");
        const data = Array.isArray(res.data?.results)
          ? res.data.results
          : Array.isArray(res.data)
            ? res.data
            : [];
        const verified = data.filter((item) => String(item?.status || "").toLowerCase() === "verified");
        setIncidents(verified);
      } catch {
        setError("Unable to load incidents for donation.");
      }
    };

    fetchIncidents();
  }, [navigate]);

  const handleAddItem = () => {
    setError("");
    if (!itemDraft.item_name.trim() || Number(itemDraft.quantity) <= 0) {
      setError("Please enter a valid item and quantity.");
      return;
    }
    setItems((prev) => [...prev, { item_name: itemDraft.item_name.trim(), quantity: Number(itemDraft.quantity) }]);
    setItemDraft(initialItem);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!incidentId) {
      setError("Please select an incident.");
      return;
    }

    if (donationType === "money" && (!amount || Number(amount) <= 0)) {
      setError("Please enter a valid donation amount.");
      return;
    }

    if (donationType === "item" && items.length === 0 && (!itemDraft.item_name || Number(itemDraft.quantity) <= 0)) {
      setError("Please add at least one item.");
      return;
    }

    setLoading(true);
    try {
      if (donationType === "money") {
        const res = await axiosInstance.post("/donations/donate/", {
          incident: incidentId,
          donation_type: "money",
          is_anonymous: isAnonymous,
          amount,
          return_url: `${window.location.origin}/payment/khalti-callback`,
        });
        if (res.data?.payment_url) {
          window.location.href = res.data.payment_url;
          return;
        }
      } else {
        const queue = [...items];
        if (itemDraft.item_name.trim() && Number(itemDraft.quantity) > 0) {
          queue.push({ item_name: itemDraft.item_name.trim(), quantity: Number(itemDraft.quantity) });
        }

        await Promise.all(
          queue.map((item) =>
            axiosInstance.post("/donations/donate/", {
              incident: incidentId,
              donation_type: "item",
              is_anonymous: isAnonymous,
              item_name: item.item_name,
              quantity: item.quantity,
            })
          )
        );
      }

      navigate("/donations");
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to process donation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-wrap py-24">
      <div className="grid gap-5 lg:grid-cols-[1.1fr_1.5fr]">
        <aside className="rounded-[28px] border border-[#cddde7] bg-[#0f2a3f] p-8 text-white">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]">
            <HandCoins size={14} />
            Contribution Flow
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight">Make a Donation</h1>
          <p className="mt-3 text-sm text-[#c8d7e4]">
            Support verified incidents with direct monetary aid or essential items.
          </p>
        </aside>

        <form onSubmit={handleSubmit} className="rounded-[28px] border border-[#d4e2eb] bg-white p-7 md:p-8">
          {error && <p className="mb-4 rounded-xl bg-[#fff1f1] px-3 py-2 text-sm text-[#b42318]">{error}</p>}

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Incident</label>
              <select
                value={incidentId}
                onChange={(e) => setIncidentId(e.target.value)}
                className="w-full rounded-xl border border-[#cfdee8] px-4 py-3 outline-none focus:border-[var(--brand)]"
                required
              >
                <option value="">Select an incident</option>
                {incidents.map((incident) => (
                  <option key={incident.id} value={incident.id}>{incident.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Donation Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDonationType("money")}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold ${donationType === "money" ? "bg-[var(--brand)] text-white" : "bg-[#f3f8fc] text-[var(--text)]"}`}
                >
                  Money
                </button>
                <button
                  type="button"
                  onClick={() => setDonationType("item")}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold ${donationType === "item" ? "bg-[var(--brand)] text-white" : "bg-[#f3f8fc] text-[var(--text)]"}`}
                >
                  Item
                </button>
              </div>
            </div>

            {donationType === "money" ? (
              <div>
                <label className="mb-1 block text-sm font-semibold text-[var(--text)]">Amount</label>
                <input
                  type="number"
                  min="10"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-[#cfdee8] px-4 py-3 outline-none focus:border-[var(--brand)]"
                  placeholder="Enter donation amount"
                />
              </div>
            ) : (
              <>
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    type="text"
                    value={itemDraft.item_name}
                    onChange={(e) => setItemDraft((prev) => ({ ...prev, item_name: e.target.value }))}
                    className="w-full rounded-xl border border-[#cfdee8] px-4 py-3 outline-none focus:border-[var(--brand)]"
                    placeholder="Item name"
                  />
                  <input
                    type="number"
                    min="1"
                    value={itemDraft.quantity}
                    onChange={(e) => setItemDraft((prev) => ({ ...prev, quantity: e.target.value }))}
                    className="w-full rounded-xl border border-[#cfdee8] px-4 py-3 outline-none focus:border-[var(--brand)]"
                    placeholder="Quantity"
                  />
                </div>
                <button type="button" onClick={handleAddItem} className="rounded-xl bg-[#f3f8fc] px-4 py-2 text-sm font-semibold text-[var(--text)]">
                  Add Item
                </button>
                {items.length > 0 && (
                  <div className="space-y-2 rounded-2xl border border-[#dce8f1] bg-[#f8fcff] p-3">
                    {items.map((item, idx) => (
                      <div key={`${item.item_name}-${idx}`} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm">
                        <span>{item.item_name} ({item.quantity})</span>
                        <button type="button" className="text-[#b42318]" onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}>Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            <label className="inline-flex items-center gap-2 text-sm text-[var(--text-soft)]">
              <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
              Donate anonymously
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-3 text-sm font-bold text-white hover:bg-[var(--brand-strong)] disabled:opacity-60"
          >
            <Gift size={14} />
            {loading ? "Processing..." : "Submit Donation"}
          </button>
        </form>
      </div>
    </div>
  );
}
