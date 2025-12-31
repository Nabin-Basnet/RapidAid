import { useState } from "react";
import axiosInstance from "../../api/Axios"; // adjust path if needed

const DonerRegister = () => {
  const [formData, setFormData] = useState({
    user_name: "",
    donor_type: "individual",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const response = await axiosInstance.post("/donations/donors/", formData);

      setSuccess("Donor ID created successfully 🎉");
      console.log("Donor Created:", response.data);

      setFormData({
        user_name: "",
        donor_type: "individual",
      });
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Failed to create Donor ID. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Create Donor ID
        </h2>

        {success && (
          <div className="mb-4 p-3 text-sm text-green-700 bg-green-100 rounded-lg">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* User Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="user_name"
              value={formData.user_name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Donor Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Donor Type
            </label>
            <select
              name="donor_type"
              value={formData.donor_type}
              onChange={handleChange}
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
            {loading ? "Creating..." : "Create Donor ID"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DonerRegister;
