// src/pages/ExpenseTracker.jsx
import { useState, useEffect } from "react";
import { apiClient } from "../utils/apiClient";
import { getCurrentUser } from "../utils/login";
import { motion, AnimatePresence } from "framer-motion";
import TableCard from "../components/TableCard";
import Tooltip from "../components/Tooltip"; // ✅ shared tooltip

export default function ExpenseTracker() {
  const userEmail = getCurrentUser();
  const [expenses, setExpenses] = useState([]);
  const [category, setCategory] = useState("feed");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [editId, setEditId] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("expenseTutorialSeen")) setShowTutorial(true);
  }, []);

  const dismissTutorial = () => {
    localStorage.setItem("expenseTutorialSeen", "true");
    setShowTutorial(false);
  };

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

  const resetForm = () => {
    setCategory("feed");
    setAmount("");
    setNote("");
    setEditId(null);
  };

  const saveExpense = async () => {
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    const payload = {
      category,
      amount: parseFloat(amount),
      note,
      date: new Date().toISOString().split("T")[0],
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
    setCategory(expense.category);
    setAmount(expense.amount);
    setNote(expense.note);
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

  return (
    <div className="flex flex-col items-center px-4 py-6 space-y-6 w-full max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        💰 Expense Tracker
      </h1>

      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-xl w-full shadow"
          >
            <p className="text-sm text-blue-800 dark:text-blue-300">
              📖 Track all poultry-related expenses. Records help you calculate profits.
            </p>
            <button
              onClick={dismissTutorial}
              className="mt-2 text-sm bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded"
            >
              Got it
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full bg-white dark:bg-white/5 p-6 rounded-2xl shadow space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Category <Tooltip text="Select expense type" />
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border rounded p-2 dark:bg-gray-800 dark:text-white"
            >
              <option value="feed">Feed</option>
              <option value="medicine">Medicine</option>
              <option value="maintenance">Maintenance</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Amount (₹) <Tooltip text="Enter amount" />
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full border rounded p-2 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Note <Tooltip text="Optional details" />
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Enter note"
            className="w-full border rounded p-2 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={saveExpense}
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded shadow"
          >
            {editId ? "Update" : "Save"}
          </button>
          {editId && (
            <button
              onClick={resetForm}
              className="bg-gray-500 hover:bg-gray-400 text-white px-4 py-2 rounded shadow"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* 📋 Expense Records Table */}
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        📋 Expense Records
      </h2>
      <TableCard className="overflow-x-auto w-full p-0">
        <table className="min-w-full bg-white dark:bg-white/5 rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-left text-gray-600 dark:text-gray-300 text-sm uppercase">
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Note</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {expenses.length > 0 ? (
                expenses.map((e) => (
                  <motion.tr
                    key={e.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <td className="px-4 py-2">{e.date}</td>
                    <td className="px-4 py-2 capitalize">{e.category}</td>
                    <td className="px-4 py-2">₹{e.amount.toFixed(2)}</td>
                    <td className="px-4 py-2">{e.note || "-"}</td>
                    <td className="px-4 py-2 flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleEdit(e)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    No expenses recorded yet
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}
