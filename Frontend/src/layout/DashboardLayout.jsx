// src/layout/DashboardLayout.jsx
import Sidebar from "../components/sidebar";
import Topbar from "../components/topbar"; // <-- Corrected to lowercase 't' to match the filename
import { Outlet } from "react-router-dom";
import { useState } from "react";

export default function DashboardLayout() {
  const [dashboardStats, setDashboardStats] = useState({
    totalBirds: 0,
    eggsToday: 0,
    totalExpenses: 0,
  });

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-grow">
        <Topbar />
        <main className="p-6 overflow-y-auto">
          {/* Pass dashboardStats & setter via context to nested routes */}
          <Outlet context={{ dashboardStats, setDashboardStats }} />
        </main>
      </div>
    </div>
  );
}