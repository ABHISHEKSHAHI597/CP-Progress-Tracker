import { motion } from "framer-motion";
import {
  FaCheckCircle,
  FaExternalLinkAlt,
} from "react-icons/fa";

function UserCard({ user }) {
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

            <p className="text-slate-400 text-lg">
              ID: {user.cfId}
            </p>

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
          value={user.lastOnline}
        />
      </div>

      {/* LAST 5 PROBLEMS */}

      <div className="mt-10">
        <h3 className="text-2xl font-semibold mb-5">
          Last 5 Problems Solved
        </h3>

        <div className="flex flex-wrap gap-3">
          {user.lastFiveSolved.map((problem) => (
            <div
              key={problem.name}
              className="
              bg-slate-800
              border
              border-slate-700
              rounded-full
              px-4
              py-2
              flex
              items-center
              gap-2
              "
            >
              <span>{problem.name}</span>

              <span className="text-purple-400 font-semibold">
                {problem.rating}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}

      <button
        className="
        mt-8
        w-full
        py-4
        rounded-xl
        bg-linear-to-r
        from-blue-600
        to-indigo-600
        hover:opacity-90
        transition
        font-semibold
        flex
        justify-center
        items-center
        gap-2
        "
      >
        View Profile

        <FaExternalLinkAlt size={12} />
      </button>
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