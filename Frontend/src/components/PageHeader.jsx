import { motion } from "framer-motion";

export default function PageHeader({ icon, title, description }) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-6 text-center md:text-left w-full max-w-4xl">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-shrink-0 inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-3xl shadow-lg"
      >
        <span className="text-4xl">{icon}</span>
      </motion.div>
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
          {description}
        </p>
      </div>
    </div>
  );
}