import { motion } from "framer-motion";
import {
  FaCheckCircle,
  FaExternalLinkAlt,
} from "react-icons/fa";

function UserCard({ user }) {
  const getLastOnline = (dateString) => {
  const now = new Date();
  const lastSeen = new Date(dateString);

  const diffMs = now - lastSeen;

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (days === 1) {
    return "Yesterday";
  }

  return `${days} days ago`;
};
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="
      bg-slate-900/70
      border
      border-slate-800
      rounded-2xl
      p-5
      shadow-lg
      w-full
      mx-auto
      "
    >
      {/* HEADER */}

      <div className="flex justify-between items-start flex-wrap gap-4">
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-full bg-linear-to-br from-purple-600 to-blue-500 flex items-center justify-center text-xl font-bold shrink-0">
            {user.handle[0].toUpperCase()}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold">
                {user.handle}
              </h2>

              <FaCheckCircle className="text-blue-400 text-sm" />
            </div>

            <p className="text-orange-400 text-sm mt-0.5 font-medium">
              {user.rank}
            </p>
          </div>
        </div>

        <div className="text-right">
          <h2 className="text-3xl font-bold text-blue-400 leading-none">
            {user.rating}
          </h2>

          <p className="text-slate-500 text-xs mt-1">
            Current Rating
          </p>
        </div>
      </div>

      {/* STATS */}

      <div className="border-t border-slate-800 my-4"></div>

      <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-4">
        <Stat
          title="Max Rating"
          value={user.maxRating}
        />

        <Stat
          title="Max Rank"
          value={user.maxRank}
        />

        <Stat
          title="Contribution"
          value={user.contribution}
        />

        <Stat
          title="Friend Of"
          value={user.friendOfCount}
        />

        <Stat
          title="Total Solved"
          value={user.totalSolved}
        />

        <Stat
          title="Solved (30d)"
          value={user.solved30}
        />

        <Stat
          title="Contests"
          value={user.contests}
        />

        <Stat
          title="Last Online"
          value={getLastOnline(user.lastOnline)}
        />
      </div>

      {/* LAST 5 PROBLEMS */}

      {user.lastFiveSolved?.length > 0 && (
        <div className="mt-5">
          <p className="text-slate-500 text-xs uppercase tracking-wide mb-2">
            Last 5 Solved
          </p>

          <div className="flex flex-wrap gap-2">
            {user.lastFiveSolved.map((problem, idx) => (
            <a
              key={idx}
              href={`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`}
              target="_blank"
              rel="noreferrer"
              className="
        px-3
        py-1.5
        text-sm
        rounded-full
        bg-slate-800
        hover:bg-slate-700
        transition
        border border-slate-700"
            >
              <span className="font-semibold">
                {problem.contestId}
                {problem.index}
              </span>

              <span className="ml-1.5 text-purple-400">
                {problem.rating}
              </span>
            </a>
            ))}
          </div>
        </div>
      )}

      {/* FOOTER */}

      <a
        href={`https://codeforces.com/profile/${user.handle}`}
        target="_blank"
        rel="noreferrer"
        className="w-full mt-5 flex justify-center items-center gap-2
  py-2.5 text-sm rounded-xl
  bg-linear-to-r from-blue-600 to-purple-600
  hover:opacity-90 transition"
      >
        View Profile
        <FaExternalLinkAlt className="text-xs" />
      </a>
    </motion.div>
  );
}

function Stat({ title, value }) {
  return (
    <div>
      <p className="text-slate-500 text-xs uppercase tracking-wide">
        {title}
      </p>

      <p className="text-lg font-bold mt-1 wrap-break-word">
        {value}
      </p>
    </div>
  );
}

export default UserCard;