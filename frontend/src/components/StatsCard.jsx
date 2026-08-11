import { motion } from "framer-motion";

function StatsCard({ title, value, icon }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-slate-900/70 border border-slate-800 rounded-xl p-4"
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-slate-400 text-xs">
            {title}
          </p>

          <h2 className="text-2xl font-bold mt-1">
            {value}
          </h2>
        </div>

        <div className="text-2xl text-blue-400">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

export default StatsCard;