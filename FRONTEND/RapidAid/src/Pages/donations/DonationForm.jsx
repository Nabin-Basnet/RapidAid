import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../../api/Axios";

const DonationForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [incidentId, setIncidentId] = useState(
    searchParams.get("incident") || ""
  );
  const [incidents, setIncidents] = useState([]);
  const [donationType, setDonationType] = useState("money");
  const [amount, setAmount] = useState("");
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
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
        setIncidents(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchIncidents();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!incidentId) {
      setError("Please select an incident.");
      return;
    }

    if (donationType === "money") {
      if (!amount || Number(amount) <= 0) {
        setError("Please enter a valid donation amount.");
        return;
      }
    } else {
      const hasItems = items.length > 0;
      const hasCurrent =
        itemName.trim().length > 0 && Number(quantity) > 0;
      if (!hasItems && !hasCurrent) {
        setError("Please add at least one item.");
        return;
      }
    }

    setLoading(true);

    try {
      if (donationType === "money") {
        const payload = {
          incident: incidentId,
          donation_type: donationType,
          is_anonymous: isAnonymous,
          amount,
        };
        await axiosInstance.post("/donations/donate/", payload);
      } else {
        const itemList = [...items];
        if (itemName.trim() && Number(quantity) > 0) {
          itemList.push({
            item_name: itemName.trim(),
            quantity: Number(quantity),
          });
        }

        await Promise.all(
          itemList.map((item) =>
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
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Failed to process donation. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setError("");
    if (!itemName.trim() || Number(quantity) <= 0) {
      setError("Please enter a valid item and quantity.");
      return;
    }
    setItems((prev) => [
      ...prev,
      { item_name: itemName.trim(), quantity: Number(quantity) },
    ]);
    setItemName("");
    setQuantity("");
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-emerald-50 px-4 py-10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="h-72 w-72 bg-sky-200/40 rounded-full blur-3xl -top-24 -right-10 absolute" />
        <div className="h-72 w-72 bg-emerald-200/40 rounded-full blur-3xl -bottom-24 -left-10 absolute" />
      </div>

      <div className="relative w-full max-w-xl bg-white/90 backdrop-blur rounded-3xl shadow-xl p-8 border border-sky-100">
        <div className="text-center mb-6">
          <p className="text-xs uppercase tracking-[0.25em] text-sky-600 font-semibold">
            RapidAid
          </p>
          <h2 className="text-3xl font-extrabold text-gray-900 mt-2">
            Make a Donation
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Choose money or items and support a verified incident.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Incident */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Incident
            </label>
            <select
              value={incidentId}
              onChange={(e) => setIncidentId(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
              required
            >
              <option value="">Select an incident</option>
              {incidents.map((incident) => (
                <option key={incident.id} value={incident.id}>
                  {incident.title}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Donation Type
            </label>
            <select
              value={donationType}
              onChange={(e) => setDonationType(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              <option value="money">Money</option>
              <option value="item">Item</option>
            </select>
          </div>

          {donationType === "money" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Donation Amount (NPR)
              </label>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="Enter amount"
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    placeholder="e.g. Blankets"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    placeholder="Enter quantity"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="w-full bg-sky-50 text-sky-700 py-2.5 rounded-xl font-semibold hover:bg-sky-100 transition border border-sky-100"
              >
                Add Item
              </button>

              {items.length > 0 && (
                <div className="border rounded-2xl p-4 space-y-2 bg-slate-50">
                  {items.map((item, index) => (
                    <div
                      key={`${item.item_name}-${index}`}
                      className="flex items-center justify-between text-sm bg-white rounded-xl px-3 py-2 border"
                    >
                      <span>
                        {item.item_name} ({item.quantity})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="flex items-center gap-2">
            <input
              id="isAnonymous"
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="isAnonymous" className="text-sm text-gray-600">
              Donate anonymously
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 text-white py-3 rounded-xl font-semibold hover:bg-sky-700 transition disabled:opacity-50 shadow-sm"
          >
            {loading ? "Processing..." : "Donate Now"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DonationForm;
