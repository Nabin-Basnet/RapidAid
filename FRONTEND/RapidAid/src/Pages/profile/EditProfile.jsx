import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/Axios";

const initialForm = { full_name: "", email: "", phone: "", password: "", profile_photo: null };

export default function EditProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await axiosInstance.get("auth/me/");
        setForm((prev) => ({ ...prev, full_name: res.data?.full_name || "", email: res.data?.email || "", phone: res.data?.phone || "" }));
        setPhotoPreview(res.data?.profile_photo_url || res.data?.profile_photo || "");
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          navigate("/login");
          return;
        }
        setError(err?.response?.data?.detail || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = new FormData();
      payload.append("full_name", form.full_name);
      payload.append("email", form.email);
      payload.append("phone", form.phone || "");
      if (form.password.trim()) payload.append("password", form.password.trim());
      if (form.profile_photo) payload.append("profile_photo", form.profile_photo);

      const res = await axiosInstance.patch("auth/me/update/", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const previous = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...previous, ...res.data }));
      setForm((prev) => ({ ...prev, password: "", profile_photo: null }));
      setPhotoPreview(res.data?.profile_photo_url || res.data?.profile_photo || photoPreview);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err?.response?.data?.detail || "Profile update failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="section-wrap min-h-screen pt-28"><div className="rounded-3xl border border-[#d4e2eb] bg-white p-8 text-sm text-[var(--text-soft)]">Loading profile...</div></div>;

  return (
    <div className="section-wrap py-24">
      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl rounded-[28px] border border-[#d4e2eb] bg-white p-7 md:p-8">
        <h1 className="text-3xl font-extrabold text-[var(--text)]">Edit Profile</h1>
        <p className="mt-2 text-sm text-[var(--text-soft)]">Update your account details and password.</p>

        {error && <p className="mt-4 rounded-xl bg-[#fff1f1] px-3 py-2 text-sm text-[#b42318]">{error}</p>}
        {success && <p className="mt-4 rounded-xl bg-[#ecfff7] px-3 py-2 text-sm text-[#0f7a5e]">{success}</p>}

        <div className="mt-6 space-y-4">
          <div>
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Profile preview"
                className="mb-3 h-24 w-24 rounded-full border border-[#cfdee8] object-cover"
              />
            )}
            <input
              className="w-full rounded-xl border border-[#cfdee8] px-4 py-3 outline-none focus:border-[var(--brand)] file:mr-3 file:rounded-lg file:border-0 file:bg-[#e8f1f8] file:px-3 file:py-2 file:text-sm"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setForm((p) => ({ ...p, profile_photo: file }));
                if (file) {
                  setPhotoPreview(URL.createObjectURL(file));
                }
              }}
            />
          </div>
          <input className="w-full rounded-xl border border-[#cfdee8] px-4 py-3 outline-none focus:border-[var(--brand)]" name="full_name" value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} required placeholder="Full name" />
          <input className="w-full rounded-xl border border-[#cfdee8] px-4 py-3 outline-none focus:border-[var(--brand)]" type="email" name="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required placeholder="Email" />
          <input className="w-full rounded-xl border border-[#cfdee8] px-4 py-3 outline-none focus:border-[var(--brand)]" name="phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone" />
          <input className="w-full rounded-xl border border-[#cfdee8] px-4 py-3 outline-none focus:border-[var(--brand)]" type="password" name="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="Leave blank to keep current password" />
        </div>

        <div className="mt-6 flex gap-3">
          <button type="submit" disabled={saving} className="rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--brand-strong)] disabled:opacity-60">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" onClick={() => navigate("/profile")} className="rounded-xl border border-[#cfe0ea] bg-white px-5 py-2.5 text-sm font-bold text-[var(--text)]">
            Back
          </button>
        </div>
      </form>
    </div>
  );
}
