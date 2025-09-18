import { motion } from "framer-motion";

export default function TableCard({ icon, title, badge, children, className = "" }) {
  return (
    <motion.div
      className={`w-full max-w-4xl glass-effect rounded-3xl p-8 shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
            <span className="text-xl">{icon}</span>
          </div>
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
        </div>
        {badge}
      </div>
      {children}
    </motion.div>
  );
}
