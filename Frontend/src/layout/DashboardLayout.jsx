// src/layout/DashboardLayout.jsx
import Sidebar from "../components/Sidebar";
import Topbar from "../components/topbar";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";

export default function DashboardLayout() {
  const [dashboardStats, setDashboardStats] = useState({
    totalBirds: 0,
    eggsToday: 0,
    totalExpenses: 0,
    feedToday: 0,
  });

  useEffect(() => {
    const storedStats = localStorage.getItem("dashboardStats");
    if (storedStats) {
      setDashboardStats(JSON.parse(storedStats));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("dashboardStats", JSON.stringify(dashboardStats));
  }, [dashboardStats]);

  return (
    <div className="flex h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
      <Sidebar />
      <div className="flex flex-col flex-grow">
        <Topbar />
        <main className="flex-grow overflow-y-auto">
          <Outlet context={{ dashboardStats, setDashboardStats }} />
        </main>
      </div>
    </div>
  );
}