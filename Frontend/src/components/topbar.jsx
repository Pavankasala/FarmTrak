// src/components/topbar.jsx
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { logOut, getCurrentUser, isLoggedIn } from "../utils/login";
import { useTheme } from "./ThemeProvider";

export default function Topbar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const user = getCurrentUser();

  const handleLogout = () => {
    logOut();
    navigate("/");
    window.location.reload();
  };

  return (
    <header className="bg-light-card dark:bg-dark-card h-16 flex items-center justify-between px-6 border-b border-light-border dark:border-dark-border transition-colors duration-300 flex-shrink-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
        <span className="font-semibold text-light-text dark:text-dark-text text-lg">
          {isLoggedIn() ? `Welcome, ${user} 🧑‍🌾` : "Welcome to FarmTrak"}
        </span>
      </div>

      <div className="flex items-center gap-4">
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