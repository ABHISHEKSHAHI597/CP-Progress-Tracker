import { Link, useLocation } from "react-router-dom";

import {
  FaHome,
  FaTrophy,
  FaCalendarAlt,
  FaUserShield,
  FaChartBar,
} from "react-icons/fa";

function Sidebar() {
  const location = useLocation();

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

  return (
    <aside className="w-72 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl min-h-screen">
      <div className="p-6">
        <h1 className="text-4xl font-bold text-blue-400">
          CP Tracker
        </h1>

        <p className="text-slate-400 text-sm mt-2">
          Track Codeforces Progress
        </p>
      </div>

      <nav className="px-4">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl mb-3 text-xl transition-all duration-300
            ${
              location.pathname === link.path
                ? "bg-blue-600 text-white shadow-lg"
                : "hover:bg-slate-800 text-slate-300"
            }`}
          >
            <span className="text-2xl">{link.icon}</span>
            <span>{link.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;