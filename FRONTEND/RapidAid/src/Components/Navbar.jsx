import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

/* ---------- AUTH HELPERS ---------- */
const isAuthenticated = () => {
  return !!localStorage.getItem("access");
};

const logout = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");
};
/* ---------------------------------- */

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const loggedIn = isAuthenticated();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Incidents", path: "/incidents" },
    { name: "Report Incident", path: "/report" },
    { name: "Donate", path: "/donate" },
    { name: "Transparency", path: "/transparency" },
  ];

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <nav className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-600">
          RapidAid
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="text-gray-700 text-base hover:text-blue-600 transition"
            >
              {item.name}
            </Link>
          ))}

          {!loggedIn ? (
            <Link
              to="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
            >
              Login
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-xl shadow hover:bg-red-600 transition"
            >
              Logout
            </button>
          )}
        </div>

        {/* Mobile Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-gray-700"
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white shadow-inner px-4 pt-2 pb-4 flex flex-col gap-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setOpen(false)}
              className="text-gray-700 text-lg hover:text-blue-600 transition"
            >
              {item.name}
            </Link>
          ))}

          {!loggedIn ? (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="w-full text-center px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
            >
              Login
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full text-center px-4 py-2 bg-red-500 text-white rounded-xl shadow hover:bg-red-600 transition"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
