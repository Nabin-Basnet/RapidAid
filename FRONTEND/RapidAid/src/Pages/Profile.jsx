import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, AlertCircle, Users, DollarSign, LogOut, MapPin, Calendar, Shield } from "lucide-react";
import axiosInstance from "../api/Axios";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [localUser, setLocalUser] = useState(null);

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("access");
        const stored = localStorage.getItem("user");
        setLocalUser(stored ? JSON.parse(stored) : null);
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await axiosInstance.get("auth/profile/");

        setProfile(res.data);
      } catch (err) {
        console.error(err);
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          navigate("/login");
          return;
        }
        if (!profile) {
          const stored = localStorage.getItem("user");
          setProfile({ user: stored ? JSON.parse(stored) : {} });
        }
        setError("Could not load profile details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) return <p className="pt-24 text-center">Loading...</p>;
  if (!profile && !error) return null;

  const {
    user = {},
    incident_activity = {},
    rescue_activity = {},
    donation_activity = {},
    volunteer_activity = {},
    recent_incidents = [],
    recent_donations = [],
    recent_volunteer = [],
  } = profile ?? {};

  const mergedUser = { ...(localUser || {}), ...user };
  const displayName = mergedUser.full_name || mergedUser.name || mergedUser.username || "User";
  const roleLabel = mergedUser.role_display || mergedUser.role || "Member";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const formatINR = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount ?? 0));

  const formatStatus = (value) => {
    if (!value) return "Status not available";
    return value
      .toString()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const hasActivity =
    (incident_activity.total_reported ?? 0) > 0 ||
    (rescue_activity.total_assignments ?? 0) > 0 ||
    Number(donation_activity.total_money_donated ?? 0) > 0 ||
    (volunteer_activity.total_assignments ?? 0) > 0 ||
    recent_incidents.length > 0 ||
    recent_donations.length > 0 ||
    recent_volunteer.length > 0;

  const secondaryStats = [
    {
      label: "Total Donations",
      value:
        donation_activity.total_money_donated || donation_activity.total_money_donated === 0
          ? formatINR(donation_activity.total_money_donated)
          : "Not available",
    },
    {
      label: "Donation Count",
      value:
        donation_activity.total_donations || donation_activity.total_donations === 0
          ? donation_activity.total_donations
          : "Not available",
    },
    {
      label: "Reported Incidents",
      value:
        incident_activity.total_reported || incident_activity.total_reported === 0
          ? incident_activity.total_reported
          : "Not available",
    },
    {
      label: "Volunteer Contributions",
      value:
        volunteer_activity.total_assignments || volunteer_activity.total_assignments === 0
          ? volunteer_activity.total_assignments
          : "Not available",
    },
    {
      label: "Rescue Assignments",
      value:
        rescue_activity.total_assignments || rescue_activity.total_assignments === 0
          ? rescue_activity.total_assignments
          : "Not available",
    },
  ];

  const detailItems = [
    { label: "User ID", value: mergedUser.id },
    { label: "Email", value: mergedUser.email },
    { label: "Phone", value: mergedUser.phone },
    { label: "Role", value: roleLabel },
    {
      label: "Joined",
      value: mergedUser.date_joined
        ? new Date(mergedUser.date_joined).toLocaleDateString()
        : null,
      icon: Calendar,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-24 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl p-8">
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 p-8 text-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-white/20 text-white flex items-center justify-center text-2xl font-bold shadow">
              {initials || <User size={36} />}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold">{displayName}</h2>
              <p className="text-white/90 mt-1 flex items-center justify-center md:justify-start gap-2 text-sm">
                <Shield size={16} /> {roleLabel}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs">
                  <Mail size={14} /> {mergedUser.email || "Email not provided"}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs">
                  <Phone size={14} /> {mergedUser.phone || "Phone not provided"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="mt-8">
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin size={18} className="text-blue-600" />
            <h3 className="font-semibold">Account Details</h3>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {detailItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3"
                >
                  <div className="flex items-center gap-3 text-gray-600">
                    {Icon ? <Icon size={16} className="text-blue-600" /> : null}
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    {item.value || "Not provided"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity */}
        <div className="mt-8">
          <div className="flex items-center gap-2 text-gray-700">
            <AlertCircle size={18} className="text-red-500" />
            <h3 className="font-semibold">Activity Snapshot</h3>
          </div>
          {hasActivity ? (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <AlertCircle className="text-red-500" size={24} />
                <span className="mt-2 font-bold text-lg">{incident_activity.total_reported ?? 0}</span>
                <span className="text-sm text-gray-500">Incidents Reported</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <Users className="text-green-500" size={24} />
                <span className="mt-2 font-bold text-lg">{rescue_activity.total_assignments ?? 0}</span>
                <span className="text-sm text-gray-500">Rescue Assignments</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <DollarSign className="text-yellow-500" size={24} />
                <span className="mt-2 font-bold text-lg">
                  {formatINR(donation_activity.total_money_donated)}
                </span>
                <span className="text-sm text-gray-500">Total Donations</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <Users className="text-emerald-500" size={24} />
                <span className="mt-2 font-bold text-lg">
                  {volunteer_activity.total_assignments ?? 0}
                </span>
                <span className="text-sm text-gray-500">Volunteer Assignments</span>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-500">
              No activity data available yet. Once you report incidents or donate, your activity will appear here.
            </p>
          )}
        </div>

        {/* Contribution Details */}
        <div className="mt-8">
          <div className="flex items-center gap-2 text-gray-700">
            <Users size={18} className="text-green-600" />
            <h3 className="font-semibold">Contribution Details</h3>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {secondaryStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <p className="text-xs uppercase tracking-wide text-gray-400">{stat.label}</p>
                <p className="mt-2 text-lg font-semibold text-gray-800">{stat.value}</p>
                {stat.value === "Not available" ? (
                  <p className="mt-2 text-xs text-gray-400">
                    Not available.
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* Incidents Summary */}
        <div className="mt-8">
          <div className="flex items-center gap-2 text-gray-700">
            <AlertCircle size={18} className="text-red-500" />
            <h3 className="font-semibold">Reported Incidents</h3>
          </div>
          {recent_incidents.length > 0 ? (
            <div className="mt-4 space-y-3">
              {recent_incidents.map((inc) => (
                <div
                  key={inc.id}
                  className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-800">{inc.title}</p>
                      <p className="text-xs text-gray-500">{inc.incident_type || "Incident"}</p>
                    </div>
                    <span className="text-xs font-medium rounded-full bg-white px-3 py-1 text-gray-600 shadow-sm">
                      {formatStatus(inc.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
              No incident details available yet.
            </div>
          )}
        </div>

        {/* Recent Donations */}
        <div className="mt-6">
          <h3 className="font-semibold text-gray-700 mb-2">Recent Donations</h3>
          {recent_donations.length > 0 ? (
            <ul className="space-y-2">
              {recent_donations.map((don) => (
                <li
                  key={don.id ?? `${don.donation_type}-${don.created_at}`}
                  className="p-3 bg-gray-50 rounded-xl shadow flex justify-between"
                >
                  <span>
                    {don.donation_type === "money"
                      ? formatINR(don.amount)
                      : `${don.item_name || "Item"}${don.quantity ? ` x${don.quantity}` : ""}`}
                  </span>
                  <span className="text-sm text-gray-500">
                    {don.incident_title || "General donation"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No recent donations</p>
          )}
        </div>

        {/* Recent Volunteer Assignments */}
        <div className="mt-6">
          <h3 className="font-semibold text-gray-700 mb-2">Volunteer Contributions</h3>
          {recent_volunteer.length > 0 ? (
            <ul className="space-y-2">
              {recent_volunteer.map((vol) => (
                <li key={vol.id} className="p-3 bg-gray-50 rounded-xl shadow flex justify-between">
                  <span>{vol.incident_title || "Incident"}</span>
                  <span className="text-sm text-gray-500">{formatStatus(vol.status)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No volunteer contributions</p>
          )}
        </div>

        {/* Logout Button */}
        <div className="mt-8">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}
