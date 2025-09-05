// src/layout/DashboardLayout.jsx
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";

export default function DashboardLayout() {
  // ✅ Initialize with defaults
  const [dashboardStats, setDashboardStats] = useState({
    totalBirds: 0,
    eggsToday: 0,
    totalExpenses: 0,
    feedToday: 0,
  });

  // ✅ Optional: persist stats in localStorage for page reloads
  useEffect(() => {
    const storedStats = localStorage.getItem("dashboardStats");
    if (storedStats) {
      setDashboardStats(JSON.parse(storedStats));
    }
  }, []);

  // ✅ Save updates to localStorage
  useEffect(() => {
    localStorage.setItem("dashboardStats", JSON.stringify(dashboardStats));
  }, [dashboardStats]);

  return (
    <div className="flex h-screen bg-light-bg dark:bg-dark-bg">
      <Sidebar />
      <div className="flex flex-col flex-grow">
        <Topbar />
        <main className="p-6 overflow-y-auto">
          {/* Pass dashboardStats & setter via context */}
          <Outlet context={{ dashboardStats, setDashboardStats }} />
        </main>
      </div>
    </div>
  );
}
