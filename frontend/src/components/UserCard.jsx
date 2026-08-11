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
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="
      bg-slate-900/70
      border
      border-slate-800
      rounded-3xl
      p-8
      shadow-xl
      w-full
      mx-auto
      "
    >
      {/* HEADER */}

      <div className="flex justify-between items-start flex-wrap gap-6">
        <div className="flex gap-5">
          <div className="w-20 h-20 rounded-full bg-linear-to-br from-purple-600 to-blue-500 flex items-center justify-center text-4xl font-bold shrink-0">
            {user.handle[0].toUpperCase()}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-4xl font-bold">
                {user.handle}
              </h2>

              <FaCheckCircle className="text-blue-400 text-xl" />
            </div>

            <p className="text-orange-400 text-2xl mt-2 font-medium">
              {user.rank}
            </p>
          </div>
        </div>

        <div className="text-right">
          <h2 className="text-6xl font-bold text-blue-400">
            {user.rating}
          </h2>

          <p className="text-slate-400 text-lg">
            Current Rating
          </p>
        </div>
      </div>

      {/* STATS */}

      <div className="border-t border-slate-800 my-8"></div>

      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
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
          title="Friend Of Count"
          value={user.friendOfCount}
        />

        <Stat
          title="Total Solved"
          value={user.totalSolved}
        />

        <Stat
          title="Solved Last 30 Days"
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

      <div className="flex flex-wrap gap-4 mt-4">
        {user.lastFiveSolved?.map((problem, idx) => (
          <a
            key={idx}
            href={`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`}
            target="_blank"
            rel="noreferrer"
            className="
      px-5
      py-3
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

            <span className="ml-2 text-purple-400">
              {problem.rating}
            </span>
          </a>
        ))}
      </div>

      {/* FOOTER */}

      <a
        href={`https://codeforces.com/profile/${user.handle}`}
        target="_blank"
        rel="noreferrer"
        className="w-full mt-8 flex justify-center items-center
  py-5 rounded-2xl
  bg-linear-to-r from-blue-600 to-purple-600
  hover:opacity-90 transition"
      >
        View Profile
      </a>
    </motion.div>
  );
}

function Stat({ title, value }) {
  return (
    <div>
      <p className="text-slate-500 text-sm uppercase tracking-wide">
        {title}
      </p>

      <p className="text-2xl font-bold mt-2 wrap-break-word">
        {value}
      </p>
    </div>
  );
}

export default UserCard;