// src/components/Topbar.jsx
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useNavigate, useOutletContext } from "react-router-dom";
import { logOut, getCurrentUser, isLoggedIn } from "../utils/login";
import { useTheme } from "./ThemeProvider";

export default function Topbar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const user = getCurrentUser();

  // ✅ Get dashboard stats from context
  const { dashboardStats } = useOutletContext();

  const handleLogout = () => {
    logOut(); 
    navigate("/"); 
    window.location.reload(); 
  };

  return (
    <header className="bg-light-bg dark:bg-gray-800 shadow h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
        <span className="font-semibold text-gray-800 dark:text-white text-lg">
          {isLoggedIn() ? `Welcome, ${user} 👨‍🌾` : "Welcome to FarmTrak"}
        </span>

        {/* ✅ Live dashboard stats */}
        {isLoggedIn() && dashboardStats && (
          <div className="flex gap-4 mt-1 sm:mt-0 text-sm text-gray-600 dark:text-gray-300">
            <span>🐓 {dashboardStats.totalBirds} birds</span>
            <span>🥚 {dashboardStats.eggsToday} eggs today</span>
            <span>💸 ₹{dashboardStats.totalExpenses}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <SunIcon className="h-6 w-6 text-yellow-400" />
          ) : (
            <MoonIcon className="h-6 w-6 text-gray-700" />
          )}
        </button>

        {isLoggedIn() && (
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            🔓 Logout
          </button>
        )}
      </div>
    </header>
  );
}
