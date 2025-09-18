import { useState, useEffect } from "react";
import { apiClient } from "../utils/apiClient";
import { motion } from "framer-motion";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import TableCard from "../components/TableCard";
import DataTable from "../components/DataTable";

const inputStyle = "w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary focus:border-transparent transition-all";
const selectStyle = inputStyle;

export default function RevenueTracker() {
  const [revenue, setRevenue] = useState([]);
  const [form, setForm] = useState({ category: "egg_sale", amount: "", note: "", date: new Date().toISOString().split("T")[0] });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRevenue = async () => {
    setLoading(true);
    try {
      const res = await apiClient.revenue.getAll();
      setRevenue(res.data || []);
    } catch (err) {
      console.error("Error fetching revenue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRevenue(); }, []);
  
  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const resetForm = () => {
    setForm({ category: "egg_sale", amount: "", note: "", date: new Date().toISOString().split("T")[0] });
    setEditId(null);
  };

  const saveRevenue = async () => {
    if (!form.amount || form.amount <= 0) return alert("Please enter a valid amount.");
    const payload = { ...form, amount: parseFloat(form.amount) };
    try {
      if (editId) await apiClient.revenue.update(editId, payload);
      else await apiClient.revenue.save(payload);
      resetForm();
      fetchRevenue();
    } catch (err) {
      console.error("Error saving revenue:", err);
      alert("Failed to save revenue.");
    }
  };

  const handleEdit = (item) => {
    setForm({ category: item.category, amount: item.amount, note: item.note, date: item.date });
    setEditId(item.id);
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this revenue entry?")) return;
    try {
      await apiClient.revenue.delete(id);
      fetchRevenue();
    } catch (err) {
      console.error("Error deleting revenue:", err);
      alert("Failed to delete revenue.");
    }
  };

  const totalRevenue = revenue.reduce((sum, r) => sum + r.amount, 0);

  const columns = [
    { header: "Date", key: "date", render: (item) => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
    { 
      header: "Source", 
      key: "category", 
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className="text-lg">{item.category === 'egg_sale' ? '🥚' : item.category === 'flock_sale' ? '🐔' : '📦'}</span>
          <span className="capitalize">{item.category.replace('_', ' ')}</span>
        </div>
      )
    },
    { header: "Amount", key: "amount", render: (item) => <span className="font-bold text-green-600 dark:text-green-400">₹{item.amount.toFixed(2)}</span> },
    { header: "Details", key: "note", render: (item) => item.note || "N/A" },
  ];

  return (
    <motion.div
      className="flex flex-col items-center px-6 py-12 space-y-8 w-full max-w-7xl mx-auto"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
    >
      <PageHeader
        icon="💰"
        title="Revenue Tracker"
        description="Track and analyze all income sources from your poultry operations"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
         <StatCard icon="💵" label="Total Revenue" value={`₹${totalRevenue.toFixed(2)}`} />
      </div>

      <motion.div className="w-full max-w-4xl glass-effect rounded-3xl p-8 shadow-xl border border-white/20 dark:border-slate-700/50" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-6">{editId ? "Edit Revenue Entry" : "Record New Revenue"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date</label>
            <input type="date" name="date" value={form.date} onChange={handleChange} className={inputStyle} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Source</label>
            <select name="category" value={form.category} onChange={handleChange} className={selectStyle}>
              <option value="egg_sale">🥚 Egg Sales</option>
              <option value="flock_sale">🐔 Flock Sales</option>
              <option value="other">📦 Other Income</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Amount (₹)</label>
            <input type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="0.00" className={inputStyle}/>
          </div>
        </div>
        <div className="space-y-2 mb-6">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Notes (Optional)</label>
            <input type="text" name="note" value={form.note} onChange={handleChange} placeholder="e.g., Sold 100 eggs to market" className={inputStyle}/>
        </div>
        <div className="flex gap-3">
          <motion.button onClick={saveRevenue} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl shadow-lg">{editId ? "Update Revenue" : "Save Revenue"}</motion.button>
          {editId && (<motion.button onClick={resetForm} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-6 py-3 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-xl">Cancel Edit</motion.button>)}
        </div>
      </motion.div>

      <TableCard
        icon="📈"
        title="Revenue History"
        badge={
          <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
            {revenue.length} {revenue.length === 1 ? 'Entry' : 'Entries'}
          </div>
        }
      >
        <DataTable
          isLoading={loading}
          data={revenue}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
        >
          <div className="space-y-3">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto"><span className="text-3xl">💰</span></div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">No revenue recorded yet</p>
          </div>
        </DataTable>
      </TableCard>
    </motion.div>
  );
}