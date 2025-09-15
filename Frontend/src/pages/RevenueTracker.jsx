import { useState, useEffect } from "react";
import { apiClient } from "../utils/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import TableCard from "../components/TableCard";
import Tooltip from "../components/Tooltip";

export default function RevenueTracker() {
  const [revenue, setRevenue] = useState([]);
  const [category, setCategory] = useState("egg_sale");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [editId, setEditId] = useState(null);

  const fetchRevenue = async () => {
    try {
      const res = await apiClient.getRevenue();
      setRevenue(res.data || []);
    } catch (err) {
      console.error("Error fetching revenue:", err);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, []);

  const resetForm = () => {
    setCategory("egg_sale");
    setAmount("");
    setNote("");
    setEditId(null);
  };

  const saveRevenue = async () => {
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    const payload = {
      category,
      amount: parseFloat(amount),
      note,
      date: new Date().toISOString().split("T")[0],
    };
    try {
      if (editId) {
        const res = await apiClient.updateRevenue(editId, payload);
        setRevenue(revenue.map((r) => (r.id === editId ? res.data : r)));
      } else {
        const res = await apiClient.saveRevenue(payload);
        setRevenue([res.data, ...revenue]);
      }
      resetForm();
    } catch (err) {
      console.error("Error saving revenue:", err);
      alert("Failed to save revenue.");
    }
  };

  const handleEdit = (item) => {
    setCategory(item.category);
    setAmount(item.amount);
    setNote(item.note);
    setEditId(item.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this revenue entry?")) return;
    try {
      await apiClient.deleteRevenue(id);
      setRevenue(revenue.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error deleting revenue:", err);
      alert("Failed to delete revenue.");
    }
  };

  return (
    <div className="flex flex-col items-center px-4 py-6 space-y-6 w-full max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        💰 Revenue Tracker
      </h1>

      <div className="w-full bg-white dark:bg-white/5 p-6 rounded-2xl shadow space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Category <Tooltip text="Select revenue source" />
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border rounded p-2 dark:bg-gray-800 dark:text-white"
            >
              <option value="egg_sale">Egg Sale</option>
              <option value="flock_sale">Flock Sale</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Amount (₹) <Tooltip text="Enter amount received" />
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
            Note <Tooltip text="Optional details about the sale" />
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g., Sold 50 eggs"
            className="w-full border rounded p-2 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={saveRevenue}
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

      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        📈 Revenue Records
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
              {revenue.length > 0 ? (
                revenue.map((r) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <td className="px-4 py-2">{r.date}</td>
                    <td className="px-4 py-2 capitalize">{r.category.replace('_', ' ')}</td>
                    <td className="px-4 py-2">₹{r.amount.toFixed(2)}</td>
                    <td className="px-4 py-2">{r.note || "-"}</td>
                    <td className="px-4 py-2 flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleEdit(r)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
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
                    No revenue recorded yet
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