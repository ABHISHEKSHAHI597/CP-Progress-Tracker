import { motion } from "framer-motion";

function StatsCard({ title, value, icon }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5"
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-slate-400 text-sm">
            {title}
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {value}
          </h2>
        </div>

        <div className="text-3xl text-blue-400">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

export default StatsCard;