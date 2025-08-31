// Frontend/src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";

/**
 * Sidebar navigation component for FarmTrak dashboard.
 * Highlights the active route and supports light/dark mode.
 */
export default function Sidebar() {
  const navClass = ({ isActive }) =>
    `px-2 py-1 rounded transition-colors duration-200 ${
      isActive
        ? "bg-indigo-600 text-white"
        : "text-light-text dark:text-dark-text hover:bg-indigo-500 hover:text-white"
    }`;

  return (
    <aside className="bg-light-bg dark:bg-dark-bg w-60 h-screen shadow-md p-4 space-y-4 transition-colors duration-200">
      <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-6">
        FarmTrak
      </h2>
      <nav className="flex flex-col space-y-2">
        <NavLink to="/dashboard" end className={navClass}>
          📋 Dashboard
        </NavLink>
        <NavLink to="/dashboard/feed" className={navClass}>
          🧠 Feed Predictor
        </NavLink>
        <NavLink to="/dashboard/flock" className={navClass}>
          🐓 Flock Management
        </NavLink>
        <NavLink to="/dashboard/eggs" className={navClass}>
          🥚 Egg Production
        </NavLink>
        <NavLink to="/dashboard/expenses" className={navClass}>
          💰 Expense Tracker
        </NavLink>
      </nav>
    </aside>
  );
}
