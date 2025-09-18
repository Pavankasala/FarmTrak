import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from "recharts";
import { apiClient } from "../utils/apiClient";
import { motion } from "framer-motion";
import StatCard from "../components/StatCard"; // Import the new component

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
    { icon: "🐔", label: "Total Birds", value: stats.totalBirds },
    { icon: "🥚", label: "Eggs Today", value: stats.eggsToday },
    { icon: "📈", label: "Profit / Loss", value: `₹${stats.profit.toFixed(2)}`, colorClass: stats.profit < 0 ? 'text-red-500' : 'text-green-500' },
    { icon: "🧾", label: "Total Expenses", value: `₹${stats.totalExpenses.toFixed(2)}` },
  ];

  return (
    <motion.div
      className="space-y-8 max-w-7xl mx-auto px-6 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">🚜 Farm Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
            <StatCard key={idx} {...card} />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-light-card dark:bg-dark-card rounded-xl shadow-sm border border-light-border dark:border-dark-border p-6">
          <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-6">Egg Production & Revenue (Last 7 days)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorEggs" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10B981" stopOpacity={0}/></linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-text-secondary)" />
                <YAxis stroke="var(--color-text-secondary)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px'}}/>
                <Legend />
                <Area type="monotone" dataKey="eggs" stroke="#10B981" fillOpacity={1} fill="url(#colorEggs)" name="Eggs Produced"/>
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (₹)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-light-card dark:bg-dark-card rounded-xl shadow-sm border border-light-border dark:border-dark-border p-6">
            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-6">Expense Breakdown</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseBreakdown} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {expenseBreakdown.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                </Pie>
                <Tooltip formatter={(value) => [`₹${value.toFixed(2)}`, 'Amount']} contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}