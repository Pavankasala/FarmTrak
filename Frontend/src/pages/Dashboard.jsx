// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getCurrentUser } from "../utils/login";
import { api } from "../utils/api";

export default function Dashboard() {
  const userEmail = getCurrentUser();

  const [stats, setStats] = useState({
    totalBirds: 0,
    eggsToday: 0,
    totalExpenses: 0,
    feedToday: 0,
  });

  const [eggTrend, setEggTrend] = useState([]);
  const [expenseTrend, setExpenseTrend] = useState([]);

  const formatDate = (isoStr) => new Date(isoStr).toISOString().split("T")[0];

  const loadDashboardData = async () => {
    try {
      const [flocksRes, expensesRes, eggsRes, feedRes] = await Promise.all([
        api.get(`/flocks`, { headers: { "X-User-Email": userEmail } }),
        api.get(`/expenses`, { headers: { "X-User-Email": userEmail } }),
        api.get(`/eggs`, { headers: { "X-User-Email": userEmail } }),
        api.get(`/feedRecords`, { headers: { "X-User-Email": userEmail } }),
      ]);

      const flocks = flocksRes.data;
      const expenses = expensesRes.data;
      const eggs = eggsRes.data;
      const feedRecords = feedRes.data;

      const totalBirds = flocks.reduce((sum, f) => sum + (f.numBirds || f.quantity || 0), 0);
      const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

      const todayStr = new Date().toISOString().split("T")[0];
      const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d;
      });

      const eggTrendData = last7Days.map((day) => {
        const dayStr = day.toISOString().split("T")[0];
        const total = eggs
          .filter((e) => formatDate(e.date) === dayStr)
          .reduce((sum, e) => sum + e.count, 0);
        return {
          date: `${day.getDate()} ${day.toLocaleString("default", { month: "short" })}`,
          eggs: total,
        };
      });

      const eggsToday = eggs
        .filter((e) => formatDate(e.date) === todayStr)
        .reduce((sum, e) => sum + e.count, 0);

      const expenseTrendData = last7Days.map((day) => {
        const dayStr = day.toISOString().split("T")[0];
        const total = expenses
          .filter((e) => formatDate(e.date) === dayStr)
          .reduce((sum, e) => sum + e.amount, 0);
        return {
          date: `${day.getDate()} ${day.toLocaleString("default", { month: "short" })}`,
          expenses: total,
        };
      });

      const feedToday = feedRecords
        .filter((r) => formatDate(r.date) === todayStr)
        .reduce((sum, r) => sum + parseFloat(r.totalFeedGiven || 0), 0);

      setStats({ totalBirds, totalExpenses, eggsToday, feedToday });
      setEggTrend(eggTrendData);
      setExpenseTrend(expenseTrendData);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 120000); // refresh every 2 mins
    return () => clearInterval(interval);
  }, [userEmail]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">🌾 Farm Dashboard</h1>
        <p className="text-light-subtext dark:text-dark-subtext mt-2">
          Quick overview of your farm stats and today’s performance
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { emoji: "🐓", label: "Total Birds", value: stats.totalBirds },
          { emoji: "🥚", label: "Eggs Produced Today", value: stats.eggsToday || "No egg data" },
          { emoji: "🧠", label: "Feed Required", value: stats.feedToday > 0 ? `${stats.feedToday.toFixed(2)} kg` : "No feed predicted" },
          { emoji: "💸", label: "Total Expenses", value: `₹${stats.totalExpenses}` },
        ].map((card, idx) => (
          <div key={idx} className="bg-light-bg dark:bg-dark-card p-4 rounded-2xl shadow text-center">
            <div className="text-2xl">{card.emoji}</div>
            <div className="font-semibold text-light-text dark:text-dark-text mt-2">{card.label}</div>
            <div className="text-light-subtext dark:text-dark-subtext mt-1">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-light-bg dark:bg-dark-card p-4 rounded-2xl shadow">
          <h2 className="font-semibold text-light-text dark:text-dark-text mb-2">🥚 Egg Production (Last 7 days)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={eggTrend}>
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip />
              <Line type="monotone" dataKey="eggs" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-light-bg dark:bg-dark-card p-4 rounded-2xl shadow">
          <h2 className="font-semibold text-light-text dark:text-dark-text mb-2">💸 Expenses (Last 7 days)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={expenseTrend}>
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip />
              <Line type="monotone" dataKey="expenses" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
