import { motion } from "framer-motion";

export default function PageHeader({ icon, title, description }) {
  return (
    <div className="text-center max-w-4xl mx-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-3xl shadow-lg mb-6"
      >
        <span className="text-4xl">{icon}</span>
      </motion.div>
      
      <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-4">
        {title}
      </h1>
      
      <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
        {description}
      </p>
    </div>
  );
}