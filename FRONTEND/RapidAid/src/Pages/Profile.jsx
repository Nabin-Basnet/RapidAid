import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, AlertCircle, Users, DollarSign, LogOut, Calendar, Shield, Activity } from "lucide-react";
import axiosInstance from "../api/Axios";
import { logoutUser } from "../Auth/utils";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-NP", { style: "currency", currency: "NPR", maximumFractionDigits: 0 }).format(Number(amount || 0));

const formatStatus = (value) =>
  value ? value.toString().replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) : "N/A";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!localStorage.getItem("access")) {
          navigate("/login");
          return;
        }
        const res = await axiosInstance.get("auth/profile/");
        setProfile(res.data);
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          navigate("/login");
          return;
        }
        setError("Could not load profile details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const data = useMemo(() => {
    const fallbackUser = JSON.parse(localStorage.getItem("user") || "{}");
    return {
      user: { ...fallbackUser, ...(profile?.user || {}) },
      incident: profile?.incident_activity || {},
      donation: profile?.donation_activity || {},
      rescue: profile?.rescue_activity || {},
      volunteer: profile?.volunteer_activity || {},
      recentIncidents: profile?.recent_incidents || [],
      recentDonations: profile?.recent_donations || [],
      recentVolunteer: profile?.recent_volunteer || [],
    };
  }, [profile]);

  if (loading) {
    return <div className="section-wrap min-h-screen pt-28"><div className="rounded-3xl border border-[#d4e2eb] bg-white p-8 text-sm text-[var(--text-soft)]">Loading profile...</div></div>;
  }

  const initials = (data.user.full_name || "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  const profilePhotoUrl = data.user.profile_photo_url || data.user.profile_photo || "";

  return (
    <div className="section-wrap pb-12 pt-24">
      {error && <p className="mb-4 rounded-xl bg-[#fff1f1] px-3 py-2 text-sm text-[#b42318]">{error}</p>}

      <section className="rounded-[28px] border border-[#cddde7] bg-[#0f2a3f] p-7 text-white md:p-9">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-2xl bg-white/15 text-2xl font-bold">
              {profilePhotoUrl && !avatarFailed ? (
                <img
                  src={profilePhotoUrl}
                  alt={`${data.user.full_name || "User"} profile`}
                  className="h-full w-full object-cover"
                  onError={() => setAvatarFailed(true)}
                />
              ) : (
                initials || <User size={26} />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold">{data.user.full_name || "User"}</h1>
              <p className="mt-1 inline-flex items-center gap-2 text-sm text-[#c8d7e4]"><Shield size={14} />{data.user.role_display || data.user.role || "Member"}</p>
            </div>
          </div>
          <button onClick={async () => { await logoutUser(); navigate("/login"); }} className="rounded-xl bg-[#b42318] px-4 py-2 text-sm font-bold text-white">
            <LogOut size={14} className="mr-1 inline" />Logout
          </button>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-[#d4e2eb] bg-white p-4"><p className="text-xs text-[var(--text-soft)]">Incidents Reported</p><p className="text-2xl font-bold">{data.incident.total_reported || 0}</p></div>
        <div className="rounded-2xl border border-[#d4e2eb] bg-white p-4"><p className="text-xs text-[var(--text-soft)]">Money Donated</p><p className="text-2xl font-bold">{formatCurrency(data.donation.total_money_donated)}</p></div>
        <div className="rounded-2xl border border-[#d4e2eb] bg-white p-4"><p className="text-xs text-[var(--text-soft)]">Volunteer Assignments</p><p className="text-2xl font-bold">{data.volunteer.total_assignments || 0}</p></div>
        <div className="rounded-2xl border border-[#d4e2eb] bg-white p-4"><p className="text-xs text-[var(--text-soft)]">Rescue Assignments</p><p className="text-2xl font-bold">{data.rescue.total_assignments || 0}</p></div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-3xl border border-[#d4e2eb] bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="inline-flex items-center gap-2 text-xl font-bold"><Activity size={16} />Account Details</h2>
            <Link to="/profile/edit" className="text-sm font-semibold text-[var(--brand)]">Edit</Link>
          </div>
          <div className="space-y-3 text-sm">
            <p className="inline-flex items-center gap-2 text-[var(--text-soft)]"><Mail size={14} />{data.user.email || "N/A"}</p>
            <p className="inline-flex items-center gap-2 text-[var(--text-soft)]"><Phone size={14} />{data.user.phone || "N/A"}</p>
            <p className="inline-flex items-center gap-2 text-[var(--text-soft)]"><Calendar size={14} />{data.user.date_joined ? new Date(data.user.date_joined).toLocaleDateString() : "N/A"}</p>
          </div>
        </article>

        <article className="rounded-3xl border border-[#d4e2eb] bg-white p-6">
          <h2 className="mb-4 inline-flex items-center gap-2 text-xl font-bold"><AlertCircle size={16} />Recent Incidents</h2>
          {data.recentIncidents.length === 0 ? <p className="text-sm text-[var(--text-soft)]">No recent incidents.</p> : (
            <div className="space-y-2">
              {data.recentIncidents.map((inc) => (
                <div key={inc.id} className="rounded-xl border border-[#e5edf4] bg-[#f8fcff] p-3">
                  <p className="font-semibold text-[var(--text)]">{inc.title}</p>
                  <p className="text-xs text-[var(--text-soft)]">{formatStatus(inc.status)}</p>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <article className="rounded-3xl border border-[#d4e2eb] bg-white p-6">
          <h2 className="mb-4 inline-flex items-center gap-2 text-xl font-bold"><DollarSign size={16} />Recent Donations</h2>
          {data.recentDonations.length === 0 ? <p className="text-sm text-[var(--text-soft)]">No recent donations.</p> : (
            <div className="space-y-2">
              {data.recentDonations.map((d) => (
                <div key={d.id} className="rounded-xl border border-[#e5edf4] bg-[#f8fcff] p-3 text-sm">
                  <p className="font-semibold">{d.donation_type === "money" ? formatCurrency(d.amount) : `${d.item_name || "Item"} x${d.quantity || 0}`}</p>
                  <p className="text-xs text-[var(--text-soft)]">{d.incident_title || "General"}</p>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="rounded-3xl border border-[#d4e2eb] bg-white p-6">
          <h2 className="mb-4 inline-flex items-center gap-2 text-xl font-bold"><Users size={16} />Volunteer Contributions</h2>
          {data.recentVolunteer.length === 0 ? <p className="text-sm text-[var(--text-soft)]">No volunteer contributions.</p> : (
            <div className="space-y-2">
              {data.recentVolunteer.map((v) => (
                <div key={v.id} className="rounded-xl border border-[#e5edf4] bg-[#f8fcff] p-3 text-sm">
                  <p className="font-semibold">{v.incident_title || "Incident"}</p>
                  <p className="text-xs text-[var(--text-soft)]">{formatStatus(v.status)}</p>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
