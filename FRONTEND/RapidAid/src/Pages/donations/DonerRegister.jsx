import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/Axios";

const DonerRegister = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [donorType, setDonorType] = useState("individual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!user?.id) {
      setError("User not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.post("/donations/donors/", {
        user: user.id,          // ✅ REQUIRED BY SERIALIZER
        donor_type: donorType,  // ✅ REQUIRED
      });

      // optional cache
      localStorage.setItem("has_donor", "true");

      navigate("/donations");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Failed to create donor. You may already be registered."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Donor Registration
        </h2>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* User Name (Read Only Display) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={user?.full_name || ""}
              disabled
              className="w-full px-4 py-2 border rounded-lg bg-gray-100"
            />
          </div>

          {/* Donor Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Donor Type
            </label>
            <select
              value={donorType}
              onChange={(e) => setDonorType(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="individual">Individual</option>
              <option value="organization">Organization</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register as Donor"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DonerRegister;
