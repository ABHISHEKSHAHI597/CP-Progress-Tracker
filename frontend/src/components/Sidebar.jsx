import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  FaHome,
  FaTrophy,
  FaCalendarAlt,
  FaUserShield,
  FaChartBar,
  FaBars,
  FaTimes,
} from "react-icons/fa";

function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    {
      name: "Home",
      path: "/",
      icon: <FaHome />,
    },
    {
      name: "Leaderboard",
      path: "/leaderboard",
      icon: <FaChartBar />,
    },
    {
      name: "Contest Tracker",
      path: "/contests",
      icon: <FaTrophy />,
    },
    {
      name: "Contest Calendar",
      path: "/calendar",
      icon: <FaCalendarAlt />,
    },
    {
      name: "Admin",
      path: "/login",
      icon: <FaUserShield />,
    },
  ];

  // Close the mobile drawer automatically whenever the route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Prevent background scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile top bar with hamburger toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 z-40">
        <span className="text-xl font-bold text-blue-400">
          CP Tracker
        </span>

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white active:scale-95 transition"
        >
          {isOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>
      </div>

      {/* Backdrop (mobile only, shown while drawer is open) */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        />
      )}

      {/* Sidebar / Drawer */}
      <aside
        className={`
          fixed left-0 top-0 h-screen w-72 max-w-[85vw]
          border-r border-slate-800 bg-slate-900/95 backdrop-blur-xl z-50
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="p-6 pt-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-blue-400">
              CP Tracker
            </h1>

            <p className="text-slate-400 text-sm mt-2">
              Track Codeforces Progress
            </p>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
            className="lg:hidden p-2 rounded-xl bg-slate-800 border border-slate-700 text-white shrink-0"
          >
            <FaTimes size={16} />
          </button>
        </div>

        <nav className="px-4 overflow-y-auto flex-1">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-4 px-5 py-3.5 sm:py-4 rounded-2xl mb-3 text-lg sm:text-xl transition-all duration-300
              ${location.pathname === link.path
                  ? "bg-blue-600 text-white shadow-lg"
                  : "hover:bg-slate-800 text-slate-300"
                }`}
            >
              <span className="text-xl sm:text-2xl">{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;