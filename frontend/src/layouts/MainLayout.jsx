import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import BackToTop from "../components/BackToTop";

function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Fixed Sidebar (drawer on mobile, fixed column on desktop) */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 lg:ml-72 flex flex-col min-w-0">
        <Navbar />

        <main className="p-4 pt-20 sm:p-6 sm:pt-24 lg:pt-6">
          <Outlet />
        </main>
      </div>

      <BackToTop />
    </div>
  );
}

export default MainLayout;