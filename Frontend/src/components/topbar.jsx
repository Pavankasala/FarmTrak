import { MoonIcon, SunIcon, Bars3Icon } from "@heroicons/react/24/outline";
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
    <header className="bg-light-card dark:bg-dark-card h-14 sm:h-16 flex items-center justify-between px-3 sm:px-4 md:px-6 border-b border-light-border dark:border-dark-border transition-colors duration-300 flex-shrink-0">
      {/* Left Section - User Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 min-w-0 flex-1">
        <span className="font-semibold text-light-text dark:text-dark-text text-sm sm:text-base lg:text-lg truncate">
          {isLoggedIn() ? (
            <>
              <span className="hidden xs:inline">Welcome, </span>
              <span className="xs:hidden">Hi, </span>
              {user} 
              <span className="ml-1">🧑‍🌾</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">Welcome to </span>
              FarmTrak
            </>
          )}
        </span>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <SunIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 transition-transform duration-300 transform rotate-0 hover:rotate-180" />
          ) : (
            <MoonIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700 dark:text-gray-300 transition-transform duration-300 transform rotate-0 hover:-rotate-12" />
          )}
        </button>

        {/* Logout Button */}
        {isLoggedIn() && (
          <button
            onClick={handleLogout}
            className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-800 transition-all duration-200"
          >
            <span className="hidden xs:inline">🔓 Logout</span>
            <span className="xs:hidden">🔓</span>
          </button>
        )}
      </div>
    </header>
  );
}