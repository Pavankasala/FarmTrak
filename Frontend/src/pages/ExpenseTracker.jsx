// src/pages/ExpenseTracker.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/api";
import { getCurrentUser } from "../utils/login";
import { motion, AnimatePresence } from "framer-motion";

// ✅ Simple Tooltip Component
function Tooltip({ text }) {
  return (
    <span className="relative group cursor-pointer ml-1">
      ℹ️
      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 
        bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 
        transition pointer-events-none z-10">
        {text}
      </span>
    </span>
  );
}

export default function ExpenseTracker() {
  const userEmail = getCurrentUser();
  const [expenses, setExpenses] = useState([]);
  const [category, setCategory] = useState("feed");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [editId, setEditId] = useState(null);

  const [showTutorial, setShowTutorial] = useState(false);

  // Tutorial banner only once
  useEffect(() => {
    const seen = localStorage.getItem("expenseTutorialSeen");
    if (!seen) {
      setShowTutorial(true);
    }
  }, []);

  const dismissTutorial = () => {
    localStorage.setItem("expenseTutorialSeen", "true");
    setShowTutorial(false);
  };

  // Fetch expenses
  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/expenses`, {
        headers: { "X-User-Email": userEmail },
      });
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
        const res = await axios.put(`${API_BASE_URL}/expenses/${editId}`, payload, {
          headers: { "X-User-Email": userEmail },
        });
        setExpenses(expenses.map((e) => (e.id === editId ? res.data : e)));
      } else {
        const res = await axios.post(`${API_BASE_URL}/expenses`, payload, {
          headers: { "X-User-Email": userEmail },
        });
        setExpenses([res.data, ...expenses]);
      }
      resetForm();
    } catch (err) {
      console.error("Error saving expense:", err);
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
      await axios.delete(`${API_BASE_URL}/expenses/${id}`, {
        headers: { "X-User-Email": userEmail },
      });
      setExpenses(expenses.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Error deleting expense:", err);
    }
  };

  return (
    <div className="flex flex-col items-center px-4 py-6 space-y-6 w-full max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">💰 Expense Tracker</h1>

      {/* Tutorial banner */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-xl w-full shadow"
          >
            <p className="text-sm text-blue-800 dark:text-blue-300">
              📖 Track all your poultry-related expenses here.  
              Choose a category, enter the amount, and add notes if needed.  
              Records will help you calculate profits later.
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

      {/* Form */}
      <div className="w-full bg-white dark:bg-white/5 p-6 rounded-2xl shadow space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Category <Tooltip text="Select the type of expense (Feed, Medicine, Maintenance, etc.)" />
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

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Amount (₹) <Tooltip text="Enter the expense amount in Indian Rupees." />
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border rounded p-2 dark:bg-gray-800 dark:text-white"
              placeholder="Enter expense amount"
            />
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Note (optional) <Tooltip text="Add extra details like shop name or bill reference." />
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border rounded p-2 dark:bg-gray-800 dark:text-white"
            placeholder="Enter details"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={saveExpense}
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded shadow"
          >
            {editId ? "Update Expense" : "Save Expense"}
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

      {/* Expense Records */}
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">📋 Expense Records</h2>
      <div className="overflow-x-auto w-full">
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
      </div>
    </div>
  );
}
