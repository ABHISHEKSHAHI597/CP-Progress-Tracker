import { Link, useLocation } from "react-router-dom";

import {
  FaHome,
  FaCalendarAlt,
  FaTrophy,
  FaUserShield,
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
    <aside className="w-72 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-400">
          CP Tracker
        </h1>

        <p className="text-slate-400 text-sm mt-1">
          Track Codeforces Progress
        </p>
      </div>

      <nav className="px-4">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all duration-300
            ${
              location.pathname === link.path
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-800 text-slate-300"
            }`}
          >
            {link.icon}
            {link.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;