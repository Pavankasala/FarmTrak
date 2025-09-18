import { motion } from "framer-motion";

export default function StatCard({ icon, label, value, colorClass = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className="glass-effect rounded-2xl p-6 text-center cursor-pointer"
    >
      <div className="text-3xl mb-2">{icon}</div>
      <div className={`text-2xl font-bold text-slate-900 dark:text-slate-100 ${colorClass}`}>
        {value}
      </div>
      <div className="text-sm text-slate-600 dark:text-slate-400 capitalize">{label}</div>
    </motion.div>
  );
}