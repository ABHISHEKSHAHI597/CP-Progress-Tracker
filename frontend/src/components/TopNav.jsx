import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

const LINKS = [
  { to: "/", label: "Overview", end: true },
  { to: "/leaderboard", label: "Standings" },
  { to: "/contests", label: "Progress" },
  { to: "/calendar", label: "Calendar" },
];

function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="20" height="20" viewBox="0 0 32 32" aria-hidden="true">
        <rect x="2" y="20" width="5" height="7" rx="1.5" fill="#45c17f" />
        <rect x="10" y="14" width="5" height="13" rx="1.5" fill="#35c2c2" />
        <rect x="18" y="9" width="5" height="18" rx="1.5" fill="#5d8dfa" />
        <rect x="26" y="4" width="5" height="23" rx="1.5" fill="#f2994a" />
      </svg>

      <span className="wide font-semibold tracking-tight text-[17px]">
        CP Tracker
      </span>
    </div>
  );
}

function TopNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const tab = ({ isActive }) =>
    `relative h-14 flex items-center px-1 text-[14px] transition-colors ${
      isActive ? "text-paper" : "text-mute hover:text-paper"
    }`;

  return (
    <header className="sticky top-0 z-40 bg-ink/90 backdrop-blur-md border-b border-line">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 h-14 flex items-center justify-between gap-6">
        <NavLink to="/" aria-label="CP Tracker home">
          <Wordmark />
        </NavLink>

        <nav className="hidden md:flex items-center gap-7" aria-label="Sections">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={tab}>
              {({ isActive }) => (
                <>
                  {link.label}
                  {isActive && (
                    <span className="absolute inset-x-0 -bottom-px h-0.5 bg-paper" />
                  )}
                </>
              )}
            </NavLink>
          ))}

          <NavLink
            to="/login"
            className="text-[14px] text-faint hover:text-paper transition-colors border border-line hover:border-mute rounded-md px-3 py-1.5"
          >
            Admin
          </NavLink>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="md:hidden -mr-1 p-2 text-mute hover:text-paper"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
            {open ? (
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            ) : (
              <path d="M3 6h14M3 13h14" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-line bg-ink">
          <nav className="px-4 py-2" aria-label="Sections">
            {[...LINKS, { to: "/login", label: "Admin" }].map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between py-3 border-b border-line-soft last:border-0 ${
                    isActive ? "text-paper" : "text-mute"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{link.label}</span>
                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-paper" />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

export default TopNav;
