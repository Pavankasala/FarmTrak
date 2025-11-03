import { motion } from "framer-motion";

export default function StatCard({ icon, label, value, colorClass = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className="bg-light-card dark:bg-dark-card rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center cursor-pointer border border-light-border dark:border-dark-border shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{icon}</div>
      <div className={`text-lg sm:text-2xl font-bold mb-1 ${
        colorClass ? colorClass : 'text-slate-900 dark:text-slate-100'
      }`}>
        {value}
      </div>
      <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 capitalize font-medium">
        {label}
      </div>
    </motion.div>
  );
}