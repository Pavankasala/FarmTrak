// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";

/**
 * Sidebar navigation component for FarmTrak dashboard.
 * Highlights the active route.
 */
export default function Sidebar() {
  return (
    <aside className="bg-white dark:bg-gray-900 w-60 h-screen shadow-md p-4 space-y-4 transition-colors">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        FarmTrak
      </h2>
      <nav className="flex flex-col space-y-2">
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) =>
            `px-2 py-1 rounded transition-colors ${
              isActive
                ? "bg-indigo-600 text-white"
                : "text-gray-700 dark:text-gray-300"
            } hover:bg-indigo-500 hover:text-white`
          }
        >
          📋 Dashboard
        </NavLink>

        <NavLink
          to="/dashboard/feed"
          className={({ isActive }) =>
            `px-2 py-1 rounded transition-colors ${
              isActive
                ? "bg-indigo-600 text-white"
                : "text-gray-700 dark:text-gray-300"
            } hover:bg-indigo-500 hover:text-white`
          }
        >
          🧠 Feed Predictor
        </NavLink>

        <NavLink
          to="/dashboard/flock"
          className={({ isActive }) =>
            `px-2 py-1 rounded transition-colors ${
              isActive
                ? "bg-indigo-600 text-white"
                : "text-gray-700 dark:text-gray-300"
            } hover:bg-indigo-500 hover:text-white`
          }
        >
          🐓 Flock Management
        </NavLink>

        <NavLink
          to="/dashboard/eggs"
          className={({ isActive }) =>
            `px-2 py-1 rounded transition-colors ${
              isActive
                ? "bg-indigo-600 text-white"
                : "text-gray-700 dark:text-gray-300"
            } hover:bg-indigo-500 hover:text-white`
          }
        >
          🥚 Egg Production
        </NavLink>

        <NavLink
          to="/dashboard/expenses"
          className={({ isActive }) =>
            `px-2 py-1 rounded transition-colors ${
              isActive
                ? "bg-indigo-600 text-white"
                : "text-gray-700 dark:text-gray-300"
            } hover:bg-indigo-500 hover:text-white`
          }
        >
          💰 Expense Tracker
        </NavLink>
      </nav>
    </aside>
  );
}
