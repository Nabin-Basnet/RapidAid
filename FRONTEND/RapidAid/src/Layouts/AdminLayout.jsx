import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import AdminSidebar from "../Components/AdminSidebar";
import { isAdminUser } from "../Pages/Admin/adminUtils";

export default function AdminLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      navigate("/login");
      return;
    }
    if (!isAdminUser()) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-transparent md:flex">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-8">
        <div className="mb-4 rounded-2xl border border-[#d2e0ea] bg-white p-4 md:hidden">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">RapidAid</p>
          <h1 className="mt-1 text-xl font-bold text-[var(--text)]">Admin Console</h1>
        </div>
        <div className="section-wrap fade-in-up max-w-none">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
