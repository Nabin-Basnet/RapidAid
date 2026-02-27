import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut, Shield, HeartHandshake } from "lucide-react";
import { getUser, isAuthenticated, logoutUser } from "../Auth/utils";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [user, setUser] = useState(() => getUser());

  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);

  const loggedIn = isAuthenticated();
  const isAdmin = user?.role === "admin";
  const profilePhotoUrl = user?.profile_photo_url || user?.profile_photo || "";
  const initials = (user?.full_name || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

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

  useEffect(() => {
    setUser(getUser());
    setAvatarFailed(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
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

    const hasDonor = localStorage.getItem("has_donor") === "true";
    if (hasDonor) {
      navigate("/donations");
    } else {
      navigate("/doner");
    }
  };
  /* ---------------------------------- */

  return (
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/40 bg-white/70 backdrop-blur-xl">
      <div className="section-wrap flex items-center justify-between py-3">
        <Link to="/" className="inline-flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--brand)] text-white shadow-md">
            <Shield size={18} />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-xl font-extrabold text-[var(--text)]">RapidAid</span>
            <span className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-soft)]">
              Response Network
            </span>
          </span>
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
                    ? "text-[var(--brand)]"
                    : "text-[var(--text-soft)] hover:text-[var(--text)]"
                }
              `}
            >
              {item.name}
              {location.pathname === item.path && (
                <span className="absolute -bottom-1 left-0 h-0.5 w-full rounded-full bg-[var(--brand)]" />
              )}
            </Link>
          ))}

          {/* Donate Button (Desktop) */}
          <button
            onClick={handleDonateClick}
            className="inline-flex items-center gap-2 rounded-full border border-[#f4bead] bg-[#fff4ef] px-4 py-2 text-sm font-semibold text-[#9c3412] transition hover:bg-[#ffe8de]"
          >
            <HeartHandshake size={16} />
            Donate
          </button>

          {!loggedIn ? (
            <Link
              to="/login"
              className="rounded-full bg-[var(--brand)] px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--brand-strong)]"
            >
              Login
            </Link>
          ) : (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-[#d0dfe8] bg-white text-[var(--text)] transition hover:border-[var(--brand)]"
              >
                {profilePhotoUrl && !avatarFailed ? (
                  <img
                    src={profilePhotoUrl}
                    alt={`${user?.full_name || "User"} avatar`}
                    className="h-full w-full object-cover"
                    onError={() => setAvatarFailed(true)}
                  />
                ) : (
                  <span className="text-sm font-bold">{initials}</span>
                )}
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-[#dae6ee] bg-white shadow-xl">
                  <div className="border-b border-[#edf2f6] px-4 py-3">
                    <p className="text-sm font-semibold text-[var(--text)]">
                      {user?.full_name || "User"}
                    </p>
                    <p className="text-xs text-[var(--text-soft)]">
                      {user?.email || ""}
                    </p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-[var(--text-soft)] transition hover:bg-[#f5faf9] hover:text-[var(--brand)]"
                  >
                    <User size={16} /> My Profile
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-[var(--text-soft)] transition hover:bg-[#f5faf9] hover:text-[var(--brand)]"
                    >
                      <User size={16} /> Admin Dashboard
                    </Link>
                  )}

                  {user?.role === "rescue_team" && (
                    <Link
                      to="/rescue"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-[var(--text-soft)] transition hover:bg-[#f5faf9] hover:text-[var(--brand)]"
                    >
                      <User size={16} /> Rescue Hub
                    </Link>
                  )}

                  {user?.role === "assessment_team" && (
                    <Link
                      to="/assessments"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-[var(--text-soft)] transition hover:bg-[#f5faf9] hover:text-[var(--brand)]"
                    >
                      <User size={16} /> Assessment Hub
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm text-[#b42318] transition hover:bg-[#fff1f1]"
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
          className="rounded-xl border border-[#d6e2ea] bg-white p-2 text-[var(--text)] md:hidden"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="section-wrap mb-3 space-y-4 rounded-2xl border border-[#dbe6ee] bg-white px-6 py-6 shadow-xl md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setOpen(false)}
              className="block text-base font-medium text-[var(--text)]"
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
            className="block w-full rounded-xl bg-[#fff3ec] px-3 py-2 text-left text-base font-semibold text-[#a93f1b]"
          >
            Donate
          </button>

          <div className="pt-4">
            {!loggedIn ? (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="block w-full rounded-xl bg-[var(--brand)] py-2 text-center font-semibold text-white"
              >
                Login
              </Link>
            ) : (
              <>
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="mb-2 block rounded-xl border border-[#c8dbe8] py-2 text-center font-semibold text-[var(--text)]"
                >
                  My Profile
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="mb-2 block rounded-xl border border-[#c8dbe8] py-2 text-center font-semibold text-[var(--text)]"
                  >
                    Admin Dashboard
                  </Link>
                )}

                {user?.role === "rescue_team" && (
                  <Link
                    to="/rescue"
                    onClick={() => setOpen(false)}
                    className="mb-2 block rounded-xl border border-[#c8dbe8] py-2 text-center font-semibold text-[var(--text)]"
                  >
                    Rescue Hub
                  </Link>
                )}

                {user?.role === "assessment_team" && (
                  <Link
                    to="/assessments"
                    onClick={() => setOpen(false)}
                    className="mb-2 block rounded-xl border border-[#c8dbe8] py-2 text-center font-semibold text-[var(--text)]"
                  >
                    Assessment Hub
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="block w-full rounded-xl bg-[#b42318] py-2 font-semibold text-white"
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
