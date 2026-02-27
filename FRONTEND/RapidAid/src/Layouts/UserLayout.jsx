import { Outlet } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

export default function UserLayout() {
  return (
    <div className="app-shell flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
