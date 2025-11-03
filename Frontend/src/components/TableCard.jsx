import { motion } from "framer-motion";

export default function TableCard({ icon, title, badge, children, className = "" }) {
  return (
    <motion.div
      className={`w-full max-w-6xl mx-auto glass-effect rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-lg sm:text-xl">{icon}</span>
          </div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-800 dark:text-slate-100 truncate">
            {title}
          </h2>
        </div>
        {badge && (
          <div className="flex-shrink-0 ml-2">
            {badge}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </motion.div>
  );
}