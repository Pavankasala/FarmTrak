// src/components/Sidebar.jsx
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChartBarIcon,
  CubeIcon,
  CurrencyDollarIcon,
  BeakerIcon,
  CreditCardIcon,
  ArchiveBoxIcon
} from "@heroicons/react/24/outline";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  const navClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-3 text-sm font-medium ${
      isActive
        ? "bg-light-primary text-white shadow-md"
        : "text-light-subtext dark:text-dark-subtext hover:bg-light-primary/10 dark:hover:bg-dark-primary/20 hover:text-light-primary dark:hover:text-dark-primary"
    }`;

    const navItems = [
      { to: "/dashboard", icon: ChartBarIcon, label: "Dashboard" },
      { to: "/dashboard/feed", icon: BeakerIcon, label: "Feed Predictor" },
      { to: "/dashboard/flock", icon: CubeIcon, label: "Flock Management" },
      { to: "/dashboard/eggs", icon: ArchiveBoxIcon, label: "Egg Production" },
      { to: "/dashboard/expenses", icon: CreditCardIcon, label: "Expense Tracker" },
      { to: "/dashboard/revenue", icon: CurrencyDollarIcon, label: "Revenue Tracker" },
    ];

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-light-primary text-white shadow-lg"
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
            className="bg-light-card dark:bg-dark-card w-64 h-screen shadow-lg p-4 space-y-4 border-r border-light-border dark:border-dark-border fixed md:static z-40 flex flex-col"
          >
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-6 px-2 flex items-center gap-2">
              <span className="text-3xl">🌾</span> FarmTrak
            </h2>
            <nav className="flex flex-col space-y-2 flex-grow">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.to} to={item.to} end={item.to === "/dashboard"} className={navClass}>
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}