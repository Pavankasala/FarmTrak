// src/components/Sidebar.jsx
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Sidebar navigation component for FarmTrak dashboard.
 * Responsive with toggle support for mobile.
 */
export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  const navClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 ${
      isActive
        ? "bg-indigo-600 text-white shadow"
        : "text-light-text dark:text-dark-text hover:bg-indigo-500 hover:text-white"
    }`;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-indigo-600 text-white shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        &#9776;
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -250, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -250, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-light-bg dark:bg-dark-bg w-60 h-screen shadow-md p-4 space-y-4 transition-colors duration-200 fixed md:static z-40"
          >
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-6">
              🌾 FarmTrak
            </h2>
            <nav className="flex flex-col space-y-2">
              <NavLink to="/dashboard" end className={navClass}>
                📊 Dashboard
              </NavLink>
              <NavLink to="/dashboard/feed" className={navClass}>
                🧠 Feed Predictor
              </NavLink>
              <NavLink to="/dashboard/flock" className={navClass}>
                🐔 Flock Management
              </NavLink>
              <NavLink to="/dashboard/eggs" className={navClass}>
                🥚 Egg Production
              </NavLink>
              <NavLink to="/dashboard/expenses" className={navClass}>
                💸 Expense Tracker
              </NavLink>
              <NavLink to="/dashboard/revenue" className={navClass}>
                💰 Revenue Tracker
              </NavLink>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}