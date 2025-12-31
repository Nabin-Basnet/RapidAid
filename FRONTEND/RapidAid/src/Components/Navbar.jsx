import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import axiosInstance from "../api/Axios"; // adjust path if needed

/* ---------- AUTH HELPERS ---------- */
const isAuthenticated = () => !!localStorage.getItem("access");

const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

const logout = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");
};
/* ---------------------------------- */

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);

  const loggedIn = isAuthenticated();
  const user = getUser();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Incidents", path: "/incidents" },
    { name: "Report Incident", path: "/report" },
    { name: "Transparency", path: "/transparency" },
  ];

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/");
  };

  /* ---------- DONATE LOGIC ---------- */
  const handleDonateClick = async () => {
    // 1. Not logged in
    if (!loggedIn) {
      navigate("/login");
      return;
    }

    try {
      // 2. Check donor existence
      await axiosInstance.get("/donors/me/");
      // Donor exists
      navigate("/donations");
    } catch (error) {
      if (error.response?.status === 404) {
        // Donor does not exist
        navigate("/doner");
      } else {
        console.error("Error checking donor status:", error);
      }
    }
  };
  /* ---------------------------------- */

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur bg-white/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold text-blue-600 tracking-tight"
        >
          RapidAid
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`relative text-sm font-medium transition
                ${
                  location.pathname === item.path
                    ? "text-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }
              `}
            >
              {item.name}
              {location.pathname === item.path && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
              )}
            </Link>
          ))}

          {/* Donate Button (Desktop) */}
          <button
            onClick={handleDonateClick}
            className="relative text-sm font-medium text-gray-700 hover:text-blue-600 transition"
          >
            Donate
          </button>

          {!loggedIn ? (
            <Link
              to="/login"
              className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition"
            >
              Login
            </Link>
          ) : (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:ring-2 hover:ring-blue-400 transition"
              >
                <User size={20} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">
                      {user?.full_name || "User"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.email || ""}
                    </p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <User size={16} /> My Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-gray-700"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white shadow-xl px-6 py-6 space-y-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setOpen(false)}
              className="block text-gray-800 text-base font-medium hover:text-blue-600"
            >
              {item.name}
            </Link>
          ))}

          {/* Donate Button (Mobile) */}
          <button
            onClick={() => {
              setOpen(false);
              handleDonateClick();
            }}
            className="block w-full text-left text-gray-800 text-base font-medium hover:text-blue-600"
          >
            Donate
          </button>

          <div className="pt-4">
            {!loggedIn ? (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="block w-full text-center py-2 bg-blue-600 text-white rounded-xl font-semibold"
              >
                Login
              </Link>
            ) : (
              <>
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="block text-center py-2 mb-2 border border-blue-600 text-blue-600 rounded-xl font-semibold"
                >
                  My Profile
                </Link>

                <button
                  onClick={handleLogout}
                  className="block w-full py-2 bg-red-500 text-white rounded-xl font-semibold"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
