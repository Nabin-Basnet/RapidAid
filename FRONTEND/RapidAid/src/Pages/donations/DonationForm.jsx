import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../api/Axios";

const DonationForm = () => {
  const navigate = useNavigate();
  const { incidentId, familyId } = useParams(); // one of them will exist

  const [donorId, setDonorId] = useState(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---------------- GET DONOR ID ---------------- */
  useEffect(() => {
    const fetchDonor = async () => {
      try {
        const res = await axiosInstance.get("/donations/donations");
        setDonorId(res.data.id);
      } catch (err) {
        console.error(err);
        navigate("/doner"); // donor not found
      }
    };

    fetchDonor();
  }, [navigate]);

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!amount || amount <= 0) {
      setError("Please enter a valid donation amount.");
      return;
    }

    setLoading(true);

    try {
      await axiosInstance.post("/donations/", {
        donor: donorId,
        donation_type: "money",
        amount: amount,
        incident: incidentId || null,
        family: familyId || null,
      });

      navigate("/donations/success");
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Donate Money
        </h2>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount */}
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
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter amount"
            />
          </div>

          {/* Info */}
          <div className="text-sm text-gray-500">
            Your donation will be used transparently to support affected
            families.
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Donate Now"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DonationForm;
