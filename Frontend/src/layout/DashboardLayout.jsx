import Sidebar from "../components/sidebar";
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
    <div className="flex h-screen bg-light-bg dark:bg-dark-bg overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Topbar - Higher z-index to stay above sidebar */}
        <div className="relative z-50">
          <Topbar />
        </div>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-light-bg dark:bg-dark-bg">
          <Outlet context={{ dashboardStats, setDashboardStats }} />
        </main>
      </div>
    </div>
  );
}