import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, AlertCircle, Users, DollarSign, LogOut } from "lucide-react";
import axios from "axios";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await axios.get("http://localhost:8000/api/auth/profile/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfile(res.data);
      } catch (err) {
        console.error(err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) return <p className="pt-24 text-center">Loading...</p>;
  if (!profile) return null;

  const { user, incident_activity, rescue_activity, donation_activity, recent_incidents, recent_donations } = profile;

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-24 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl p-8">
        
        {/* Avatar & Basic Info */}
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow">
            <User size={42} />
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-800">{user.full_name}</h2>
          <p className="text-sm text-gray-500">{user.role_display}</p>
        </div>

        {/* Contact Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
            <Mail className="text-blue-600" size={18} />
            <span className="text-sm text-gray-700">{user.email || "Not provided"}</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
            <Phone className="text-blue-600" size={18} />
            <span className="text-sm text-gray-700">{user.phone || "Not provided"}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl shadow">
            <AlertCircle className="text-red-500" size={24} />
            <span className="mt-2 font-bold text-lg">{incident_activity.total_reported}</span>
            <span className="text-sm text-gray-500">Incidents Reported</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl shadow">
            <Users className="text-green-500" size={24} />
            <span className="mt-2 font-bold text-lg">{rescue_activity.total_assignments}</span>
            <span className="text-sm text-gray-500">Rescue Assignments</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl shadow">
            <DollarSign className="text-yellow-500" size={24} />
            <span className="mt-2 font-bold text-lg">{donation_activity.total_money_donated}</span>
            <span className="text-sm text-gray-500">Total Donations</span>
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="mt-8">
          <h3 className="font-semibold text-gray-700 mb-2">Recent Incidents</h3>
          {recent_incidents.length > 0 ? (
            <ul className="space-y-2">
              {recent_incidents.map((inc) => (
                <li key={inc.id} className="p-3 bg-gray-50 rounded-xl shadow flex justify-between">
                  <span>{inc.title}</span>
                  <span className="text-sm text-gray-500">{inc.incident_type}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No recent incidents</p>
          )}
        </div>

        {/* Recent Donations */}
        <div className="mt-6">
          <h3 className="font-semibold text-gray-700 mb-2">Recent Donations</h3>
          {recent_donations.length > 0 ? (
            <ul className="space-y-2">
              {recent_donations.map((don, idx) => (
                <li key={idx} className="p-3 bg-gray-50 rounded-xl shadow flex justify-between">
                  <span>{don.donation_type === "money" ? `₹ ${don.amount}` : don.item_description}</span>
                  <span className="text-sm text-gray-500">{new Date(don.created_at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No recent donations</p>
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
