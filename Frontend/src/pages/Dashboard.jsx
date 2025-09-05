// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { api } from "../utils/api";
import { useOutletContext } from "react-router-dom";

export default function Dashboard() {
  // ✅ Safe fallback for GitHub Pages direct access
  const outletContext = useOutletContext() || {};
  const { dashboardStats = {}, setDashboardStats = () => {} } = outletContext;

  const [stats, setStats] = useState(dashboardStats);
  const [eggTrend, setEggTrend] = useState([]);
  const [expenseTrend, setExpenseTrend] = useState([]);
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [birdsPerFlock, setBirdsPerFlock] = useState([]);
  const [feedPerFlock, setFeedPerFlock] = useState([]);

  const COLORS = ["#10B981", "#F59E0B", "#3B82F6", "#EF4444", "#8B5CF6"];

  const formatDate = (isoStr) => new Date(isoStr).toISOString().split("T")[0];

  const loadDashboardData = async () => {
    try {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) return;

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

      // ---------------- Stats ----------------
      const totalBirds = flocks.reduce((sum, f) => sum + (f.numBirds || 0), 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      const todayStr = new Date().toISOString().split("T")[0];
      const eggsToday = eggs
        .filter((e) => formatDate(e.date) === todayStr)
        .reduce((sum, e) => sum + e.count, 0);
      const feedToday = feedRecords
        .filter((r) => formatDate(r.date) === todayStr)
        .reduce((sum, r) => sum + parseFloat(r.totalFeedGiven || 0), 0);

      const newStats = { totalBirds, totalExpenses, eggsToday, feedToday };
      setStats(newStats);
      setDashboardStats(newStats);

      // ---------------- Trends ----------------
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

      setEggTrend(eggTrendData);
      setExpenseTrend(expenseTrendData);

      // ---------------- Pie Charts ----------------
      const expenseByCat = ["Feed", "Medicine", "Labor", "Other"].map((cat) => ({
        name: cat,
        value: expenses.filter((e) => e.category === cat).reduce((sum, e) => sum + e.amount, 0),
      }));
      setExpensesByCategory(expenseByCat);

      const birdsFlock = flocks.map((f) => ({
        name: f.birdType === "Other" ? f.customBird : f.birdType,
        value: f.numBirds,
      }));
      setBirdsPerFlock(birdsFlock);

      const feedFlock = flocks.map((f) => {
        const totalFeed = feedRecords
          .filter((r) => r.flockId === f.id)
          .reduce((sum, r) => sum + parseFloat(r.totalFeedGiven || 0), 0);
        return { name: f.birdType === "Other" ? f.customBird : f.birdType, value: totalFeed };
      });
      setFeedPerFlock(feedFlock);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 120000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">🌾 Farm Dashboard</h1>

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

      {/* Line Charts */}
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

      {/* Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-light-bg dark:bg-dark-card p-4 rounded-2xl shadow">
          <h2 className="font-semibold text-light-text dark:text-dark-text mb-2">💰 Expenses by Category</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={expensesByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                {expensesByCategory.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-light-bg dark:bg-dark-card p-4 rounded-2xl shadow">
          <h2 className="font-semibold text-light-text dark:text-dark-text mb-2">🐓 Birds per Flock</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={birdsPerFlock} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                {birdsPerFlock.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-light-bg dark:bg-dark-card p-4 rounded-2xl shadow">
          <h2 className="font-semibold text-light-text dark:text-dark-text mb-2">🧴 Feed Usage per Flock</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={feedPerFlock} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                {feedPerFlock.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
