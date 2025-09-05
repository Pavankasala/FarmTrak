import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { api } from "../utils/api";
import { useOutletContext } from "react-router-dom";

export default function Dashboard() {
  const outletContext = useOutletContext() || {};
  const { dashboardStats = {}, setDashboardStats = () => {} } = outletContext;

  const [stats, setStats] = useState(dashboardStats);
  const [eggTrend, setEggTrend] = useState([]);
  const [expenseTrend, setExpenseTrend] = useState([]);
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [birdsPerType, setBirdsPerType] = useState([]);
  const [feedPerType, setFeedPerType] = useState([]);

  const COLORS = ["#10B981", "#F59E0B", "#3B82F6", "#EF4444", "#8B5CF6"];

  const formatDate = (isoStr) => new Date(isoStr).toISOString().split("T")[0];

  const loadDashboardData = async () => {
    try {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) return;

      const [flocksRes, expensesRes, eggsRes, feedRes] = await Promise.all([
        api.get("/flocks", { headers: { "X-User-Email": userEmail } }),
        api.get("/expenses", { headers: { "X-User-Email": userEmail } }),
        api.get("/eggs", { headers: { "X-User-Email": userEmail } }),
        api.get("/feedRecords", { headers: { "X-User-Email": userEmail } }),
      ]);

      const flocks = flocksRes.data;
      const expenses = expensesRes.data;
      const eggs = eggsRes.data;
      const feedRecords = feedRes.data;

      // ---------------- Stats ----------------
      const totalBirds = flocks.reduce((sum, f) => sum + (f.numBirds || 0), 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      const todayStr = new Date().toISOString().split("T")[0];
      const eggsToday = eggs.filter(e => formatDate(e.date) === todayStr)
                            .reduce((sum, e) => sum + e.count, 0);
      const feedToday = feedRecords.filter(r => formatDate(r.date) === todayStr)
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

      setEggTrend(last7Days.map(day => {
        const dayStr = formatDate(day);
        return {
          date: `${day.getDate()} ${day.toLocaleString("default", { month: "short" })}`,
          eggs: eggs.filter(e => formatDate(e.date) === dayStr)
                    .reduce((sum, e) => sum + e.count, 0),
        };
      }));

      setExpenseTrend(last7Days.map(day => {
        const dayStr = formatDate(day);
        return {
          date: `${day.getDate()} ${day.toLocaleString("default", { month: "short" })}`,
          expenses: expenses.filter(e => formatDate(e.date) === dayStr)
                            .reduce((sum, e) => sum + e.amount, 0),
        };
      }));

      // ---------------- Pie Charts ----------------
      const expenseByCat = ["Feed", "Medicine", "Labor", "Other"].map(cat => ({
        name: cat,
        value: expenses.filter(e => e.category === cat)
                       .reduce((sum, e) => sum + e.amount, 0),
      }));
      setExpensesByCategory(expenseByCat);

      // Birds per type
      const birdsType = flocks.map(f => ({
        name: f.birdType === "Other" ? f.customBird : f.birdType,
        value: f.numBirds,
      }));
      setBirdsPerType(birdsType);

      // Feed per bird type (sum all feedRecords matching birdType)
      const feedType = birdsType.map(b => {
        const totalFeed = feedRecords
          .filter(r => r.birdName === b.name)
          .reduce((sum, r) => sum + parseFloat(r.totalFeedGiven || 0), 0);
        return { name: b.name, value: totalFeed };
      });
      setFeedPerType(feedType);

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
      {/* Stats, Line Charts, Pie Charts JSX stays same */}
    </div>
  );
}
