// src/components/Topbar.jsx
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useNavigate, useOutletContext } from "react-router-dom";
import { logOut, getCurrentUser, isLoggedIn } from "../utils/login";
import { useTheme } from "./ThemeProvider";

export default function Topbar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const user = getCurrentUser();

  // ✅ Safe fallback for outletContext
  const outletContext = useOutletContext() || {};
  const { dashboardStats = {} } = outletContext;

  const handleLogout = () => {
    logOut();
    navigate("/");
    window.location.reload();
  };

  return (
    <header className="bg-light-bg dark:bg-gray-800 shadow h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      {/* Left section: Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
        <span className="font-semibold text-gray-800 dark:text-white text-lg">
          {isLoggedIn() ? `Welcome, ${user} 👨‍🌾` : "Welcome to FarmTrak"}
        </span>
      </div>

      {/* Right section: Controls */}
      <div className="flex items-center gap-4">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <SunIcon className="h-6 w-6 text-yellow-400 transition-transform duration-300 transform rotate-0 hover:rotate-180" />
          ) : (
            <MoonIcon className="h-6 w-6 text-gray-700 dark:text-gray-300 transition-transform duration-300 transform rotate-0 hover:-rotate-12" />
          )}
        </button>

        {/* Logout */}
        {isLoggedIn() && (
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-800 transition"
          >
            🔓 Logout
          </button>
        )}
      </div>
    </header>
  );
}
