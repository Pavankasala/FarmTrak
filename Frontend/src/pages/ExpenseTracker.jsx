import { useState, useEffect } from "react";
import { apiClient } from "../utils/apiClient";
import { motion } from "framer-motion";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import TableCard from "../components/TableCard";
import DataTable from "../components/DataTable";
import Tooltip from "../components/Tooltip";

const inputStyle = "w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary focus:border-transparent transition-all";
const selectStyle = inputStyle;

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ category: "feed", amount: "", notes: "", date: new Date().toISOString().split("T")[0] });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await apiClient.expenses.getAll();
      setExpenses(res.data || []);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const resetForm = () => {
    setForm({ category: "feed", amount: "", notes: "", date: new Date().toISOString().split("T")[0] });
    setEditId(null);
  };

  const saveExpense = async () => {
    if (!form.amount || form.amount <= 0) return alert("Please enter a valid amount.");
    const payload = { ...form, amount: parseFloat(form.amount) };
    try {
      if (editId) await apiClient.expenses.update(editId, payload);
      else await apiClient.expenses.save(payload);
      resetForm();
      fetchExpenses();
    } catch (err) {
      console.error("Error saving expense:", err);
      alert("Failed to save expense.");
    }
  };

  const handleEdit = (expense) => {
    setForm({ category: expense.category, amount: expense.amount, notes: expense.notes, date: expense.date });
    setEditId(expense.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await apiClient.expenses.delete(id);
      fetchExpenses();
    } catch (err) {
      console.error("Error deleting expense:", err);
      alert("Failed to delete expense.");
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const columns = [
    { header: "Date", key: "date", render: (item) => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
    {
      header: "Category",
      key: "category",
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className="text-lg">{item.category === 'feed' ? '🌾' : item.category === 'medicine' ? '💊' : item.category === 'maintenance' ? '🛠️' : '📦'}</span>
          <span className="capitalize text-slate-900 dark:text-slate-100 font-medium">{item.category}</span>
        </div>
      )
    },
    { header: "Amount", key: "amount", render: (item) => <span className="font-bold text-slate-900 dark:text-slate-100">₹{item.amount.toFixed(2)}</span> },
    { header: "Description", key: "notes", render: (item) => item.notes || "N/A" },
  ];

  return (
    <motion.div
      className="min-h-screen bg-light-bg dark:bg-dark-bg py-8 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader
          icon="💸"
          title="Expense Management Hub"
          description="Track and manage all your farm expenses with detailed categorization and insights"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <StatCard icon="💰" label="Total Expenses" value={`₹${totalExpenses.toFixed(2)}`} />
        </div>

        <motion.div 
          className="max-w-6xl mx-auto glass-effect rounded-3xl p-8 shadow-xl border border-white/20 dark:border-slate-700/50" 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-6">
            {editId ? "Edit Expense" : "Record New Expense"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <span className="text-lg">📅</span>Date<Tooltip text="Date the expense was incurred" />
              </label>
              <input type="date" name="date" value={form.date} onChange={handleChange} className={inputStyle} />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <span className="text-lg">🏷️</span>Category<Tooltip text="Categorize your expense" />
              </label>
              <select name="category" value={form.category} onChange={handleChange} className={selectStyle}>
                <option value="feed">🌾 Feed & Nutrition</option>
                <option value="medicine">💊 Medicine & Healthcare</option>
                <option value="maintenance">🛠️ Equipment & Maintenance</option>
                <option value="other">📦 Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <span className="text-lg">💵</span>Amount (₹)<Tooltip text="Enter the total amount spent" />
              </label>
              <input type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="0.00" className={inputStyle} />
            </div>
          </div>
          <div className="space-y-2 mb-6">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <span className="text-lg">📝</span>Note (Optional)<Tooltip text="Add any relevant details" />
            </label>
            <input type="text" name="notes" value={form.notes} onChange={handleChange} placeholder="e.g., Premium layer feed - 50kg bags" className={inputStyle} />
          </div>
          <div className="flex gap-3">
            <motion.button 
              onClick={saveExpense} 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }} 
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl shadow-lg"
            >
              {editId ? "Update Expense" : "Save Expense"}
            </motion.button>
            {editId && (
              <motion.button 
                onClick={resetForm} 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }} 
                className="px-6 py-3 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-xl"
              >
                Cancel Edit
              </motion.button>
            )}
          </div>
        </motion.div>

        <TableCard
          icon="💸"
          title="Expense Records"
          badge={
            <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm font-medium">
              {expenses.length} {expenses.length === 1 ? 'Record' : 'Records'}
            </div>
          }
        >
          <DataTable
            isLoading={loading}
            data={expenses}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
          >
            <div className="space-y-3">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">💸</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">No expenses recorded yet</p>
            </div>
          </DataTable>
        </TableCard>
      </div>
    </motion.div>
  );
}