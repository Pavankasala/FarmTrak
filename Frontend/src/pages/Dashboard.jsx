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
import { apiClient } from "../utils/apiClient";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalBirds: "No data",
    eggsToday: "No data",
    feedToday: "No data",
    totalExpenses: "No data",
  });
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

      const [flocksRes, expensesRes, eggsRes] = await Promise.all([
        apiClient.getFlocks(),
        apiClient.getExpenses(),
        apiClient.getEggProductions(),
      ]);

      const flocks = flocksRes.data || [];
      const expenses = expensesRes.data || [];
      const eggs = eggsRes.data || [];

      const totalBirds = flocks.reduce((sum, f) => sum + (f.numBirds || 0), 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const todayStr = new Date().toISOString().split("T")[0];
      const eggsToday = eggs.filter((e) => e.date?.startsWith(todayStr)).length;

      setStats({
        totalBirds,
        eggsToday,
        feedToday: "No data", // placeholder
        totalExpenses,
      });

      const mockTrend = Array.from({ length: 7 }, (_, i) => ({
        date: `Day ${i + 1}`,
        eggs: Math.floor(Math.random() * 10),
        expenses: Math.floor(Math.random() * 500),
      }));

      setEggTrend(mockTrend);
      setExpenseTrend(mockTrend);

      setExpensesByCategory([
        { name: "Feed", value: 2000 },
        { name: "Labor", value: 1500 },
        { name: "Medicine", value: 1000 },
        { name: "Other", value: 500 },
      ]);

      setBirdsPerFlock([
        { name: "Broiler", value: 500 },
        { name: "Layer", value: 300 },
        { name: "Other", value: 200 },
      ]);

      setEggsByBirdType([
        { name: "Broiler", value: 400 },
        { name: "Layer", value: 200 },
        { name: "Other", value: 100 },
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <motion.div
      className="space-y-8 max-w-6xl mx-auto px-4 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">🌾 Farm Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { emoji: "🐓", label: "Total Birds", value: stats.totalBirds },
          { emoji: "🥚", label: "Eggs Today", value: stats.eggsToday },
          { emoji: "🧠", label: "Feed Required", value: stats.feedToday },
          { emoji: "💸", label: "Total Expenses", value: `₹${stats.totalExpenses}` },
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
            <div className="font-semibold text-light-text dark:text-dark-text mt-2">{card.label}</div>
            <div className="text-light-subtext dark:text-dark-subtext mt-1">{card.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: "🥚 Egg Production (7 days)", data: eggTrend, key: "eggs", stroke: "#10B981", empty: "No data" },
          { title: "💸 Expenses (7 days)", data: expenseTrend, key: "expenses", stroke: "#F59E0B", empty: "No data" }
        ].map((chart, idx) => (
          <motion.div
            key={idx}
            className="bg-light-bg dark:bg-dark-card p-4 rounded-2xl shadow"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 250, damping: 20, delay: idx * 0.15 }}
            whileHover={{ scale: 1.05 }}
          >
            <h2 className="font-semibold text-light-text dark:text-dark-text mb-2">{chart.title}</h2>
            {chart.data.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chart.data}>
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip />
                  <Line type="monotone" dataKey={chart.key} stroke={chart.stroke} strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-10">{chart.empty}</p>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "💰 Expenses by Category", data: expensesByCategory },
          { title: "🐓 Birds per Flock", data: birdsPerFlock },
          { title: "🥚 Eggs by Bird Type", data: eggsByBirdType }
        ].map((pie, idx) => (
          <motion.div
            key={idx}
            className="bg-light-bg dark:bg-dark-card p-4 rounded-2xl shadow"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 250, damping: 20, delay: idx * 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            <h2 className="font-semibold text-light-text dark:text-dark-text mb-2">{pie.title}</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pie.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
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
