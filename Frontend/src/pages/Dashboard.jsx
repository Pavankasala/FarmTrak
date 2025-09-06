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
import { motion } from "framer-motion";

export default function Dashboard() {
  const outletContext = useOutletContext() || {};
  const { dashboardStats = {}, setDashboardStats = () => {} } = outletContext;

  const [stats, setStats] = useState(dashboardStats);
  const [eggTrend, setEggTrend] = useState([]);
  const [expenseTrend, setExpenseTrend] = useState([]);
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [birdsPerFlock, setBirdsPerFlock] = useState([]);
  const [eggsByBirdType, setEggsByBirdType] = useState([]);

  const COLORS = ["#10B981", "#F59E0B", "#3B82F6", "#EF4444", "#8B5CF6"];

  const loadDashboardData = async () => {
    try {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) return;

      const flocksRes = await api.get(`/flocks`, {
        headers: { "X-User-Email": userEmail },
      });
      const flocks = flocksRes.data || [];
      if (!flocks.length) return;

      const flockId = flocks[0].id;

      const [expensesRes, eggsRes, feedRes] = await Promise.all([
        api.get(`/expenses`, { headers: { "X-User-Email": userEmail } }),
        api.get(`/eggs`, { headers: { "X-User-Email": userEmail } }),
        api.get(`/feedRecords?flockId=${flockId}`, {
          headers: { "X-User-Email": userEmail },
        }),
      ]);

      const expenses = expensesRes.data || [];
      const eggs = eggsRes.data || [];
      const feedRecords = feedRes.data || [];

      const totalBirds = flocks.reduce((sum, f) => sum + (f.numBirds || 0), 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const todayStr = new Date().toISOString().split("T")[0];
      const eggsToday = eggs
        .filter((e) => e.date?.startsWith(todayStr))
        .reduce((sum, e) => sum + (e.count || 0), 0);
      const feedToday = feedRecords
        .filter((r) => r.date?.startsWith(todayStr))
        .reduce((sum, r) => sum + parseFloat(r.totalFeedGiven || 0), 0);

      const newStats = { totalBirds, totalExpenses, eggsToday, feedToday };
      setStats(newStats);
      setDashboardStats(newStats);

      const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d;
      });

      const eggTrendData = last7Days.map((day) => {
        const dayStr = day.toISOString().split("T")[0];
        const total = eggs
          .filter((e) => e.date?.startsWith(dayStr))
          .reduce((sum, e) => sum + (e.count || 0), 0);
        return {
          date: `${day.getDate()} ${day.toLocaleString("default", {
            month: "short",
          })}`,
          eggs: total,
        };
      });

      const expenseTrendData = last7Days.map((day) => {
        const dayStr = day.toISOString().split("T")[0];
        const total = expenses
          .filter((e) => e.date?.startsWith(dayStr))
          .reduce((sum, e) => sum + (e.amount || 0), 0);
        return {
          date: `${day.getDate()} ${day.toLocaleString("default", {
            month: "short",
          })}`,
          expenses: total,
        };
      });

      setEggTrend(eggTrendData);
      setExpenseTrend(expenseTrendData);

      const knownCats = ["feed", "medicine", "labor"];
      let expenseByCat = knownCats.map((cat) => ({
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        value:
          expenses
            .filter((e) => e.category?.toLowerCase() === cat)
            .reduce((sum, e) => sum + (e.amount || 0), 0) || 0,
      }));
      const otherTotal = expenses
        .filter((e) => !knownCats.includes(e.category?.toLowerCase()))
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      expenseByCat.push({ name: "Other", value: otherTotal || 0.01 });
      setExpensesByCategory(expenseByCat);

      const knownBirds = ["Broiler", "Layer"];
      let birdsFlock = knownBirds.map((type) => {
        const flock = flocks.find((f) => f.birdType === type);
        return { name: type, value: flock ? flock.numBirds : 0 };
      });
      const otherBirds = flocks
        .filter((f) => !knownBirds.includes(f.birdType))
        .reduce((sum, f) => sum + (f.numBirds || 0), 0);
      birdsFlock.push({ name: "Other", value: otherBirds || 0.01 });
      setBirdsPerFlock(birdsFlock);

      let eggsByTypeData = knownBirds.map((type) => {
        const flocksOfType = flocks.filter((f) => f.birdType === type);
        const totalEggs = flocksOfType.reduce((sum, f) => {
          return (
            sum +
            eggs
              .filter((e) => e.flockId === f.id)
              .reduce((s, e) => s + (e.count || 0), 0)
          );
        }, 0);
        return { name: type, value: totalEggs };
      });
      const otherEggs = flocks
        .filter((f) => !knownBirds.includes(f.birdType))
        .reduce(
          (sum, f) =>
            sum +
            eggs
              .filter((e) => e.flockId === f.id)
              .reduce((s, e) => s + (e.count || 0), 0),
          0
        );
      eggsByTypeData.push({ name: "Other", value: otherEggs || 0.01 });
      setEggsByBirdType(eggsByTypeData);
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
    <motion.div
      className="space-y-8 max-w-6xl mx-auto px-4 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">
        🌾 Farm Dashboard
      </h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { emoji: "🐓", label: "Total Birds", value: stats.totalBirds ?? 0 },
          {
            emoji: "🥚",
            label: "Eggs Produced Today",
            value: stats.eggsToday || "No egg data",
          },
          {
            emoji: "🧠",
            label: "Feed Required",
            value:
              stats.feedToday > 0
                ? `${stats.feedToday.toFixed(2)} kg`
                : "No feed predicted",
          },
          {
            emoji: "💸",
            label: "Total Expenses",
            value: `₹${stats.totalExpenses ?? 0}`,
          },
        ].map((card, idx) => (
          <motion.div
            key={idx}
            className="bg-light-bg dark:bg-dark-card p-4 rounded-2xl shadow text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 250, damping: 20, delay: idx * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-2xl">{card.emoji}</div>
            <div className="font-semibold text-light-text dark:text-dark-text mt-2">
              {card.label}
            </div>
            <div className="text-light-subtext dark:text-dark-subtext mt-1">
              {card.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Line Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: "🥚 Egg Production (Last 7 days)", data: eggTrend, key: "eggs", stroke: "#10B981", empty: "No egg data" },
          { title: "💸 Expenses (Last 7 days)", data: expenseTrend, key: "expenses", stroke: "#F59E0B", empty: "No expense data" }
        ].map((chart, idx) => (
          <motion.div
            key={idx}
            className="bg-light-bg dark:bg-dark-card p-4 rounded-2xl shadow"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 250, damping: 20, delay: idx * 0.15 }}
            whileHover={{ scale: 1.05 }}
          >
            <h2 className="font-semibold text-light-text dark:text-dark-text mb-2">
              {chart.title}
            </h2>
            {chart.data.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chart.data}>
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey={chart.key}
                    stroke={chart.stroke}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-10">{chart.empty}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "💰 Expenses by Category", data: expensesByCategory },
          { title: "🐓 Birds per Flock", data: birdsPerFlock },
          { title: "🥚 Eggs Produced by Bird Type", data: eggsByBirdType }
        ].map((pie, idx) => (
          <motion.div
            key={idx}
            className="bg-light-bg dark:bg-dark-card p-4 rounded-2xl shadow"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 250, damping: 20, delay: idx * 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            <h2 className="font-semibold text-light-text dark:text-dark-text mb-2">
              {pie.title}
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pie.data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label
                >
                  {pie.data.map((entry, i) => (
                    <Cell key={`cell-${idx}-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
