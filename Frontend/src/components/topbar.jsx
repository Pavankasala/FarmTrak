import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useNavigate, useLocation } from "react-router-dom";
import { logOut, getCurrentUser, isLoggedIn } from "../utils/login";
import { useTheme } from "./ThemeProvider";
import { useState, useEffect } from "react";
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

export default function Topbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const user = getCurrentUser();
  const [showSidebar, setShowSidebar] = useState(false);

  // Close sidebar when route changes
  useEffect(() => {
    setShowSidebar(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logOut();
    navigate("/");
    window.location.reload();
  };

  const sidebarItems = [
    { 
      label: "Dashboard", 
      path: "/dashboard", 
      icon: ChartBarIcon, 
      color: "text-blue-500"
    },
    { 
      label: "Feed Predictor", 
      path: "/dashboard/feed", 
      icon: BeakerIcon, 
      color: "text-green-500"
    },
    { 
      label: "Flock Management", 
      path: "/dashboard/flock", 
      icon: CubeIcon, 
      color: "text-orange-500"
    },
    { 
      label: "Egg Production", 
      path: "/dashboard/eggs", 
      icon: ArchiveBoxIcon, 
      color: "text-yellow-500"
    },
    { 
      label: "Expense Tracker", 
      path: "/dashboard/expenses", 
      icon: CreditCardIcon, 
      color: "text-red-500"
    },
    { 
      label: "Revenue Tracker", 
      path: "/dashboard/revenue", 
      icon: CurrencyDollarIcon, 
      color: "text-emerald-500"
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setShowSidebar(false);
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // FIXED: Better active state detection
  const isActiveRoute = (itemPath) => {
    if (itemPath === "/dashboard") {
      // Dashboard is active only when exactly on /dashboard
      return location.pathname === "/dashboard";
    } else {
      // Other routes are active when pathname includes the route
      return location.pathname === itemPath;
    }
  };

  return (
    <>
      <header className="bg-light-card dark:bg-dark-card h-16 flex items-center justify-between px-4 border-b border-light-border dark:border-dark-border shadow-sm relative z-50">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {showSidebar ? <XMarkIcon className="w-5 h-5" /> : "☰"}
          </button>
          
          <span className="font-semibold text-light-text dark:text-dark-text text-sm sm:text-base truncate">
            {isLoggedIn() ? (
              <>
                <span className="hidden sm:inline">Welcome, </span>
                <span className="sm:hidden">Hi, </span>
                <span className="font-bold">{user}</span>
                <span className="ml-1">🧑‍🌾</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Welcome to </span>
                <span className="font-bold">FarmTrak</span>
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-light-border dark:hover:bg-dark-border transition-all duration-200"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <SunIcon className="h-5 w-5 text-yellow-400" />
            ) : (
              <MoonIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            )}
          </button>

          {isLoggedIn() && (
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 transition-all duration-200"
            >
              🔓
            </button>
          )}
        </div>
      </header>

      {/* FIXED: Mobile Sidebar - NO BLUR OVERLAY */}
      <AnimatePresence>
        {showSidebar && (
          <>
            {/* REMOVED: No overlay - no blur at all */}
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ 
                type: "spring", 
                damping: 25, 
                stiffness: 200
              }}
              className="md:hidden fixed left-0 top-16 w-80 h-[calc(100vh-4rem)] bg-white dark:bg-slate-900 shadow-2xl z-40 flex flex-col border-r border-light-border dark:border-dark-border"
            >
              {/* Header */}
              <div className="p-4 border-b border-light-border dark:border-dark-border">
                <h2 className="text-lg font-bold text-light-text dark:text-dark-text flex items-center gap-2">
                  <span className="text-xl">🌿</span> 
                  <span>Navigation</span>
                </h2>
              </div>
              
              {/* Navigation - FIXED ACTIVE STATE */}
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActiveRoute(item.path);
                  
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                        isActive
                          ? "bg-blue-500 text-white shadow-md"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-light-text dark:text-dark-text"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? "text-white" : item.color}`} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </motion.div>

            {/* CLICK OUTSIDE TO CLOSE - Invisible overlay */}
            <div 
              className="md:hidden fixed inset-0 z-30" 
              onClick={() => setShowSidebar(false)}
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
}