import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import BackToTop from "../components/BackToTop";

function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-72 flex flex-col">
        <Navbar />

        <main className="p-6">
          <Outlet />
        </main>
      </div>

      <BackToTop />
    </div>
  );
}

export default MainLayout;