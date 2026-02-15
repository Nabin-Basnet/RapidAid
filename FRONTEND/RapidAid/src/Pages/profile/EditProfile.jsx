import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/Axios";

const initialForm = {
  full_name: "",
  email: "",
  phone: "",
  password: "",
};

export default function EditProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await axiosInstance.get("auth/me/");
        setForm((prev) => ({
          ...prev,
          full_name: res.data?.full_name || "",
          email: res.data?.email || "",
          phone: res.data?.phone || "",
        }));
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          navigate("/login");
          return;
        }
        setError(err?.response?.data?.detail || "Failed to load your profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
      };

      if (form.password.trim()) {
        payload.password = form.password.trim();
      }

      const res = await axiosInstance.patch("auth/me/update/", payload);

      const previous = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...previous,
          ...res.data,
        })
      );

      setForm((prev) => ({ ...prev, password: "" }));
      setSuccess("Profile updated successfully.");
    } catch (err) {
      const detail =
        err?.response?.data?.detail ||
        "Profile update failed. Please check your fields.";
      setError(detail);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <div className="max-w-2xl mx-auto bg-white border rounded-2xl p-8 text-center text-slate-600">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Edit Profile</h1>
        <p className="text-sm text-slate-500 mt-2">
          Update your account details and password.
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              New Password (optional)
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Leave blank to keep current password"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="bg-slate-100 text-slate-700 rounded-lg px-4 py-2 font-semibold"
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
