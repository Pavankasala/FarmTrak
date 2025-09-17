// src/pages/ExpenseTracker.jsx
import { useState, useEffect } from "react";
import { apiClient } from "../utils/apiClient";
import { getCurrentUser } from "../utils/login";
import { motion, AnimatePresence } from "framer-motion";
import TableCard from "../components/TableCard";
import Tooltip from "../components/Tooltip";

export default function ExpenseTracker() {
  const userEmail = getCurrentUser();
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    category: "feed",
    amount: "",
    note: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [editId, setEditId] = useState(null);

  const fetchExpenses = async () => {
    try {
      const res = await apiClient.getExpenses();
      setExpenses(res.data || []);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  
  const resetForm = () => {
    setForm({
      category: "feed",
      amount: "",
      note: "",
      date: new Date().toISOString().split("T")[0],
    });
    setEditId(null);
  };

  const saveExpense = async () => {
    if (!form.amount || form.amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    const payload = {
      ...form,
      amount: parseFloat(form.amount),
      userEmail,
    };
    try {
      if (editId) {
        const res = await apiClient.updateExpense(editId, payload);
        setExpenses(expenses.map((e) => (e.id === editId ? res.data : e)));
      } else {
        const res = await apiClient.saveExpense(payload);
        setExpenses([res.data, ...expenses]);
      }
      resetForm();
    } catch (err) {
      console.error("Error saving expense:", err);
      alert("Failed to save expense.");
    }
  };

  const handleEdit = (expense) => {
    setForm({
      category: expense.category,
      amount: expense.amount,
      note: expense.note,
      date: expense.date,
    });
    setEditId(expense.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await apiClient.deleteExpense(id);
      setExpenses(expenses.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Error deleting expense:", err);
      alert("Failed to delete expense.");
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  return (
    <motion.div 
      className="flex flex-col items-center px-6 py-12 space-y-8 w-full max-w-7xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-6 text-center md:text-left w-full max-w-4xl">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-shrink-0 inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-400 to-pink-500 rounded-3xl shadow-lg"
        >
          <span className="text-4xl">🧾</span>
        </motion.div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Expense Management Hub
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
            Track and manage all your farm expenses with detailed categorization and insights
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-effect rounded-2xl p-6 text-center"
        >
          <div className="text-3xl mb-2">💵</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">₹{totalExpenses.toFixed(2)}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Total Expenses</div>
        </motion.div>
        
        {Object.entries(categoryTotals).slice(0, 3).map(([cat, total], index) => (
          <motion.div
            key={cat}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="glass-effect rounded-2xl p-6 text-center"
          >
            <div className="text-2xl mb-2">
              {cat === 'feed' ? '🌾' : cat === 'medicine' ? '💊' : cat === 'maintenance' ? '🔧' : '📦'}
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">₹{total.toFixed(2)}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400 capitalize">{cat}</div>
          </motion.div>
        ))}
      </div>

      {/* Add Expense Form */}
      <motion.div 
        className="w-full max-w-4xl glass-effect rounded-3xl p-8 shadow-xl border border-white/20 dark:border-slate-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
            <span className="text-xl">{editId ? "✏️" : "➕"}</span>
          </div>
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
            {editId ? "Edit Expense" : "Record New Expense"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <span className="text-lg">🗓️</span>
              Date
              <Tooltip text="Date the expense was incurred" />
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <span className="text-lg">📋</span>
              Category
              <Tooltip text="Categorize your expense" />
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="feed">🌾 Feed & Nutrition</option>
              <option value="medicine">💊 Medicine & Healthcare</option>
              <option value="maintenance">🔧 Equipment & Maintenance</option>
              <option value="other">📦 Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <span className="text-lg">💵</span>
              Amount (₹)
              <Tooltip text="Enter the total amount spent" />
            </label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <span className="text-lg">📝</span>
            Note (Optional)
            <Tooltip text="Add any relevant details" />
          </label>
          <input
            type="text"
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="e.g., Premium layer feed - 50kg bags"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex gap-3">
          <motion.button
            onClick={saveExpense}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:from-emerald-700 hover:to-green-700"
          >
            {editId ? "Update Expense" : "Save Expense"}
          </motion.button>
          {editId && (
            <motion.button
              onClick={resetForm}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors"
            >
              Cancel Edit
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Expenses Table */}
      <motion.div
        className="w-full max-w-6xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <TableCard className="glass-effect rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden p-0">
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Expense Records</h2>
            </div>
            <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm font-medium">
              {expenses.length} {expenses.length === 1 ? 'Record' : 'Records'}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                <AnimatePresence>
                  {expenses.length > 0 ? (
                    expenses.map((expense, index) => (
                      <motion.tr
                        key={expense.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-slate-900 dark:text-slate-100 font-medium">
                          {new Date(expense.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {expense.category === 'feed' ? '🌾' : 
                               expense.category === 'medicine' ? '💊' : 
                               expense.category === 'maintenance' ? '🔧' : '📦'}
                            </span>
                            <span className="capitalize text-slate-900 dark:text-slate-100 font-medium">
                              {expense.category}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                            ₹{expense.amount.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                          {expense.note || "No description provided"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <motion.button
                              onClick={() => handleEdit(expense)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium shadow-sm"
                            >
                              Edit
                            </motion.button>
                            <motion.button
                              onClick={() => handleDelete(expense.id)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium shadow-sm"
                            >
                              Delete
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="space-y-3">
                          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                            <span className="text-3xl">🧾</span>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 font-medium">No expenses recorded yet</p>
                          <p className="text-sm text-slate-400 dark:text-slate-500">Start tracking your farm expenses to monitor profitability</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </TableCard>
      </motion.div>
    </motion.div>
  );
}