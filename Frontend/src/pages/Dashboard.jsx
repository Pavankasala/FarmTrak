// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getCurrentUser } from "../utils/login";

export default function Dashboard() {
  const userEmail = getCurrentUser(); // get logged-in user dynamically

  const [stats, setStats] = useState({
    totalBirds: 0,
    eggsToday: 0,
    totalExpenses: 0,
    feedToday: 0
  });

  const [eggTrend, setEggTrend] = useState([]);
  const [expenseTrend, setExpenseTrend] = useState([]);

  const loadDashboardData = async () => {
    try {
      // Fetch all data
      const [flocksRes, expensesRes, eggsRes] = await Promise.all([
        axios.get(`http://localhost:8080/api/flocks?userEmail=${userEmail}`),
        axios.get(`http://localhost:8080/api/expenses?userEmail=${userEmail}`),
        axios.get(`http://localhost:8080/api/eggs?userEmail=${userEmail}`)
      ]);

      const flocks = flocksRes.data;
      const expenses = expensesRes.data;
      const eggs = eggsRes.data;

      const totalBirds = flocks.reduce((sum, f) => sum + f.quantity, 0);
      const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

      const todayStr = new Date().toISOString().split("T")[0];

      // Last 7 days
      const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d;
      });

      // Egg trend data
      const eggTrendData = last7Days.map(day => {
        const dayStr = day.toISOString().split("T")[0];
        const total = eggs
          .filter(e => e.date.split("T")[0] === dayStr)
          .reduce((sum, e) => sum + e.count, 0);
        return {
          date: `${day.getDate()} ${day.toLocaleString('default', { month: 'short' })}`,
          eggs: total
        };
      });

      const eggsToday = eggs.filter(e => e.date.split("T")[0] === todayStr)
                            .reduce((sum, e) => sum + e.count, 0);

      // Expense trend data
      const expenseTrendData = last7Days.map(day => {
        const dayStr = day.toISOString().split("T")[0];
        const total = expenses
          .filter(e => e.date.split("T")[0] === dayStr)
          .reduce((sum, e) => sum + e.amount, 0);
        return {
          date: `${day.getDate()} ${day.toLocaleString('default', { month: 'short' })}`,
          expenses: total
        };
      });

      // Feed today from localStorage (user-specific)
      const allFeedRecords = JSON.parse(localStorage.getItem("feedRecords") || "[]");
      const feedToday = allFeedRecords
        .filter(r => r.userEmail === userEmail && r.date.split("T")[0] === todayStr)
        .reduce((sum, r) => sum + parseFloat(r.total || 0), 0);

      setStats({ totalBirds, totalExpenses, eggsToday, feedToday });
      setEggTrend(eggTrendData);
      setExpenseTrend(expenseTrendData);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, [userEmail]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🌾 Farm Dashboard</h1>
        <p className="text-gray-700 dark:text-gray-300 mt-2">Quick overview of your farm stats and today’s performance</p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[ 
          { emoji: "🐓", label: "Total Birds", value: stats.totalBirds },
          { emoji: "🥚", label: "Eggs Produced Today", value: stats.eggsToday || "No egg data" },
          { emoji: "🧠", label: "Feed Required", value: stats.feedToday > 0 ? `${stats.feedToday.toFixed(2)} kg` : "No feed predicted" },
          { emoji: "💸", label: "Total Expenses", value: `₹${stats.totalExpenses}` }
        ].map((card, idx) => (
          <div key={idx} className="bg-white dark:bg-white/5 p-4 rounded-2xl shadow text-center">
            <div className="text-2xl">{card.emoji}</div>
            <div className="font-semibold text-gray-900 dark:text-white mt-2">{card.label}</div>
            <div className="text-gray-700 dark:text-gray-300 mt-1">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Small Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-white/5 p-4 rounded-2xl shadow">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-2">🥚 Egg Production (Last 7 days)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={eggTrend}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="eggs" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-white/5 p-4 rounded-2xl shadow">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-2">💸 Expenses (Last 7 days)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={expenseTrend}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="expenses" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
