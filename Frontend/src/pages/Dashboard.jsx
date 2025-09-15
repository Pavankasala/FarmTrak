// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
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
  CartesianGrid,
} from "recharts";
import { apiClient } from "../utils/apiClient";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalBirds: 0,
    eggsToday: 0,
    profit: 0,
    totalExpenses: 0,
  });
  const [trendData, setTrendData] = useState([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  
  const COLORS = ["#10B981", "#F59E0B", "#3B82F6", "#EF4444", "#8B5CF6"];

  const loadDashboardData = async () => {
    try {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) return;

      const [flocksRes, expensesRes, eggsRes, revenueRes] = await Promise.all([
        apiClient.getFlocks(),
        apiClient.getExpenses(),
        apiClient.getEggProductions(),
        apiClient.getRevenue(),
      ]);

      const flocks = flocksRes.data || [];
      const expenses = expensesRes.data || [];
      const eggs = eggsRes.data || [];
      const revenue = revenueRes.data || [];

      // 1. Calculate and set the main statistics
      const totalBirds = flocks.reduce((sum, f) => sum + (f.numBirds || 0), 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const totalRevenue = revenue.reduce((sum, r) => sum + (r.amount || 0), 0);
      const todayStr = new Date().toISOString().split("T")[0];
      const eggsToday = eggs
        .filter((e) => e.date?.startsWith(todayStr))
        .reduce((sum, e) => sum + (e.count || 0), 0);

      setStats({
        totalBirds,
        eggsToday,
        profit: totalRevenue - totalExpenses,
        totalExpenses,
      });

      // 2. Process data for the Area chart (last 7 days trend)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split("T")[0];
      }).reverse();

      const combinedTrendData = last7Days.map(date => {
        const dailyTotalRevenue = revenue
          .filter(r => r.date === date)
          .reduce((sum, r) => sum + r.amount, 0);
        const dailyTotalEggs = eggs
          .filter(e => e.date === date)
          .reduce((sum, e) => sum + e.count, 0);
        return {
          month: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: dailyTotalRevenue,
          eggs: dailyTotalEggs,
        };
      });
      setTrendData(combinedTrendData);

      // 3. Process data for "Expenses by Category" pie chart
      const expensesData = expenses.reduce((acc, expense) => {
        const category = expense.category || 'Other';
        acc[category] = (acc[category] || 0) + expense.amount;
        return acc;
      }, {});
      setExpenseBreakdown(Object.entries(expensesData).map(([name, value], index) => ({ 
        name, 
        value,
        color: COLORS[index % COLORS.length]
      })));

    } catch (err) {
      console.error("Failed to load dashboard data:", err);
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { emoji: "🐔", label: "Total Birds", value: stats.totalBirds },
          { emoji: "🥚", label: "Eggs Today", value: stats.eggsToday },
          { emoji: "📈", label: "Profit / Loss", value: `₹${stats.profit.toFixed(2)}` },
          { emoji: "💸", label: "Total Expenses", value: `₹${stats.totalExpenses.toFixed(2)}` },
        ].map((card, idx) => (
          <motion.div
            key={idx}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 250, damping: 20, delay: idx * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-3xl">{card.emoji}</div>
            <div className="font-semibold text-light-text dark:text-dark-text mt-2">{card.label}</div>
            <div className={`text-light-subtext dark:text-dark-subtext mt-1 text-lg font-bold ${card.label.includes('Profit') && (stats.profit < 0 ? 'text-red-500' : 'text-green-500')}`}>
              {card.value}
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Egg Production & Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Egg Production & Revenue
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">📈</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Last 7 days</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorEggs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="eggs"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#colorEggs)"
                  name="Eggs Produced"
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Revenue (₹)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Expense Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Expense Breakdown
            </h3>
             <div className="flex items-center space-x-2">
               <span className="text-2xl">💰</span>
               <span className="text-sm text-gray-600 dark:text-gray-400">
                 Total: ₹{stats.totalExpenses.toFixed(2)}
               </span>
             </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`₹${value.toFixed(2)}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}