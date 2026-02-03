import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/Axios";

const DonerRegister = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!user) {
      setError("User not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.post("/donations/donor/create/");

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50 px-4 py-10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="h-64 w-64 bg-emerald-200/40 rounded-full blur-3xl -top-16 -left-20 absolute" />
        <div className="h-72 w-72 bg-amber-200/40 rounded-full blur-3xl -bottom-20 -right-16 absolute" />
      </div>

      <div className="relative w-full max-w-md bg-white/90 backdrop-blur rounded-3xl shadow-xl p-8 border border-emerald-100">
        <div className="text-center mb-6">
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-600 font-semibold">
            Join the Network
          </p>
          <h2 className="text-3xl font-extrabold text-gray-900 mt-2">
            Donor Registration
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Register once to start supporting verified incidents.
          </p>
        </div>

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
              className="w-full px-4 py-3 border rounded-xl bg-gray-100 text-gray-700"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50 shadow-sm"
          >
            {loading ? "Registering..." : "Register as Donor"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DonerRegister;
