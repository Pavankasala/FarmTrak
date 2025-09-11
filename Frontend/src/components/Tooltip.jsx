// src/components/Tooltip.jsx
import { motion } from "framer-motion";

/**
 * Simple reusable Tooltip component used across the app.
 * Keeps style and animation consistent.
 *
 * Usage:
 * <Tooltip text="Helpful hint here" />
 */
export default function Tooltip({ text }) {
  return (
    <span className="relative group cursor-pointer inline-flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
      </svg>

      <motion.span
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.12 }}
        className="absolute left-1/2 -translate-x-1/2 -top-8 w-max max-w-xs px-2 py-1 rounded-md bg-gray-900 text-white text-xs shadow-md opacity-0 group-hover:opacity-100 pointer-events-none"
        aria-hidden="true"
      >
        {text}
      </motion.span>
    </span>
  );
}
