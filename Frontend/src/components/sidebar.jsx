import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChartBarIcon,
  CubeIcon,
  CurrencyDollarIcon,
  BeakerIcon,
  CreditCardIcon,
  ArchiveBoxIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on window resize (desktop)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navClass = ({ isActive }) =>
    `px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-3 text-sm font-medium relative ${
      isActive
        ? "bg-light-primary text-white shadow-md"
        : "text-light-subtext dark:text-dark-subtext hover:bg-light-primary/10 dark:hover:bg-dark-primary/20 hover:text-light-primary dark:hover:text-dark-primary"
    }`;

  const navItems = [
    { to: "/dashboard", icon: ChartBarIcon, label: "Dashboard", color: "text-blue-500" },
    { to: "/dashboard/feed", icon: BeakerIcon, label: "Feed Predictor", color: "text-green-500" },
    { to: "/dashboard/flock", icon: CubeIcon, label: "Flock Management", color: "text-orange-500" },
    { to: "/dashboard/eggs", icon: ArchiveBoxIcon, label: "Egg Production", color: "text-yellow-500" },
    { to: "/dashboard/expenses", icon: CreditCardIcon, label: "Expense Tracker", color: "text-red-500" },
    { to: "/dashboard/revenue", icon: CurrencyDollarIcon, label: "Revenue Tracker", color: "text-emerald-500" },
  ];

  return (
    <>
      {/* Mobile Menu Button - Fixed position, lower z-index than topbar */}
      <button
        className="md:hidden fixed top-4 left-4 z-40 p-2.5 rounded-xl bg-light-primary hover:bg-light-primaryHover text-white shadow-lg transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="w-5 h-5 flex items-center justify-center"
        >
          {isOpen ? <XMarkIcon className="w-5 h-5" /> : "☰"}
        </motion.div>
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex bg-light-card dark:bg-dark-card w-64 h-screen shadow-lg border-r border-light-border dark:border-dark-border flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-light-border dark:border-dark-border">
          <h2 className="text-xl font-bold text-light-text dark:text-dark-text flex items-center gap-3">
            <span className="text-2xl">🌿</span> 
            <span>FarmTrak</span>
          </h2>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink 
                key={item.to} 
                to={item.to} 
                end={item.to === "/dashboard"} 
                className={navClass}
              >
                <Icon className={`h-5 w-5 ${item.color}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="md:hidden fixed left-0 top-0 w-72 h-full bg-light-card dark:bg-dark-card shadow-2xl z-35 flex flex-col"
          >
            {/* Mobile Header */}
            <div className="p-6 border-b border-light-border dark:border-dark-border">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-light-text dark:text-dark-text flex items-center gap-3">
                  <span className="text-2xl">🌿</span> 
                  <span>FarmTrak</span>
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-light-border dark:hover:bg-dark-border transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-light-subtext dark:text-dark-subtext" />
                </button>
              </div>
            </div>
            
            {/* Mobile Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink 
                    key={item.to} 
                    to={item.to} 
                    end={item.to === "/dashboard"} 
                    className={navClass}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className={`h-5 w-5 ${item.color}`} />
                    <span>{item.label}</span>
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