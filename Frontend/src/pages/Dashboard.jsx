import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from "recharts";
import { apiClient } from "../utils/apiClient";
import { motion } from "framer-motion";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const [stats, setStats] = useState({ totalBirds: 0, eggsToday: 0, profit: 0, totalExpenses: 0 });
  const [trendData, setTrendData] = useState([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  
  const COLORS = ["#10B981", "#F59E0B", "#3B82F6", "#EF4444", "#8B5CF6"];

  const loadDashboardData = async () => {
    try {
      const [flocksRes, expensesRes, eggsRes, revenueRes] = await Promise.all([
        apiClient.flocks.getAll(),
        apiClient.expenses.getAll(),
        apiClient.eggs.getAll(),
        apiClient.revenue.getAll(),
      ]);

      const flocks = flocksRes.data || [];
      const expenses = expensesRes.data || [];
      const eggs = eggsRes.data || [];
      const revenue = revenueRes.data || [];

      const totalBirds = flocks.reduce((sum, f) => sum + (f.numBirds || 0), 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const totalRevenue = revenue.reduce((sum, r) => sum + (r.amount || 0), 0);
      const todayStr = new Date().toISOString().split("T")[0];
      const eggsToday = eggs.filter((e) => e.date?.startsWith(todayStr)).reduce((sum, e) => sum + (e.count || 0), 0);

      setStats({ totalBirds, eggsToday, profit: totalRevenue - totalExpenses, totalExpenses });

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split("T")[0];
      }).reverse();

      const combinedTrendData = last7Days.map(date => ({
        month: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: revenue.filter(r => r.date === date).reduce((sum, r) => sum + r.amount, 0),
        eggs: eggs.filter(e => e.date === date).reduce((sum, e) => sum + e.count, 0),
      }));
      setTrendData(combinedTrendData);

      const expensesData = expenses.reduce((acc, expense) => {
        const category = expense.category || 'Other';
        acc[category] = (acc[category] || 0) + expense.amount;
        return acc;
      }, {});
      setExpenseBreakdown(Object.entries(expensesData).map(([name, value], index) => ({ 
        name, value, color: COLORS[index % COLORS.length]
      })));

    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    }
  };

  useEffect(() => { loadDashboardData(); }, []);
  
  const statCards = [
    { icon: "🐔", label: "Total Birds", value: stats.totalBirds, colorClass: "text-blue-600" },
    { icon: "🥚", label: "Eggs Today", value: stats.eggsToday, colorClass: "text-yellow-600" },
    { icon: "📈", label: "Profit / Loss", value: `₹${stats.profit.toFixed(2)}`, colorClass: stats.profit < 0 ? 'text-red-500' : 'text-green-500' },
    { icon: "💰", label: "Total Expenses", value: `₹${stats.totalExpenses.toFixed(2)}`, colorClass: "text-red-600" },
  ];

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-light-text dark:text-dark-text mb-2">
            🚜 Farm Dashboard
          </h1>
          <p className="text-sm sm:text-base text-light-subtext dark:text-dark-subtext">
            Welcome to your farm management center
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto"
        >
          {statCards.map((card, idx) => (
            <StatCard key={idx} {...card} />
          ))}
        </motion.div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 max-w-7xl mx-auto">
          {/* Production Chart */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.3 }} 
            className="bg-light-card dark:bg-dark-card rounded-xl sm:rounded-2xl shadow-sm border border-light-border dark:border-dark-border p-4 sm:p-6"
          >
            <h3 className="text-lg sm:text-xl font-semibold text-light-text dark:text-dark-text mb-2">
              📊 Egg Production & Revenue
            </h3>
            <p className="text-sm text-light-subtext dark:text-dark-subtext mb-4">Last 7 days</p>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-600" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#64748b" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                    className="dark:bg-slate-800 dark:border-slate-600"
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="eggs" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorEggs)" 
                    name="Eggs Produced"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    name="Revenue (₹)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Expense Breakdown Chart */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.4 }} 
            className="bg-light-card dark:bg-dark-card rounded-xl sm:rounded-2xl shadow-sm border border-light-border dark:border-dark-border p-4 sm:p-6"
          >
            <h3 className="text-lg sm:text-xl font-semibold text-light-text dark:text-dark-text mb-2">
              💸 Expense Breakdown
            </h3>
            <p className="text-sm text-light-subtext dark:text-dark-subtext mb-4">By category</p>
            
            {expenseBreakdown.length === 0 ? (
              <div className="h-64 sm:h-80 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-light-subtext dark:text-dark-subtext">No expense data available</p>
                </div>
              </div>
            ) : (
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <Pie 
                      data={expenseBreakdown} 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={80}
                      innerRadius={40}
                      dataKey="value" 
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} 
                      labelLine={false}
                      fontSize={12}
                    >
                      {expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`₹${value.toFixed(2)}`, 'Amount']} 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                      className="dark:bg-slate-800 dark:border-slate-600"
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          <h2 className="text-lg sm:text-xl font-semibold text-light-text dark:text-dark-text mb-4 text-center">
            🚀 Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[
              { label: "Add Flock", icon: "🐔", to: "/dashboard/flock" },
              { label: "Record Eggs", icon: "🥚", to: "/dashboard/eggs" },
              { label: "Add Expense", icon: "💸", to: "/dashboard/expenses" },
              { label: "Add Revenue", icon: "💰", to: "/dashboard/revenue" },
              { label: "Feed Calculator", icon: "🌾", to: "/dashboard/feed" },
              { label: "View Reports", icon: "📊", to: "/dashboard" },
            ].map((action, idx) => (
              <motion.a
                key={idx}
                href={`#${action.to}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-3 sm:p-4 text-center hover:shadow-md transition-all duration-200"
              >
                <div className="text-2xl sm:text-3xl mb-2">{action.icon}</div>
                <div className="text-xs sm:text-sm font-medium text-light-text dark:text-dark-text">
                  {action.label}
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}