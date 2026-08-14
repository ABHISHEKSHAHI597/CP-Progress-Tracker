import { motion } from "framer-motion";

function StatsCard({ title, value, icon }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 sm:p-4"
    >
      <div className="flex justify-between items-center gap-2">
        <div className="min-w-0">
          <p className="text-slate-400 text-xs truncate">
            {title}
          </p>

          <h2 className="text-xl sm:text-2xl font-bold mt-1 truncate">
            {value}
          </h2>
        </div>

        <div className="text-xl sm:text-2xl text-blue-400 shrink-0">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

export default StatsCard;