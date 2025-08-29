//Frontend\src\pages\ExpenseTracker.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { getCurrentUser } from "../utils/login";

const API_BASE_URL = process.env.REACT_APP_API_URL;

export default function ExpenseTracker() {
  const userEmail = getCurrentUser(); // logged-in user

  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    id: null,
    category: "",
    amount: "",
    date: "",
    notes: "",
    paid: false,
  });
  const [isEditing, setIsEditing] = useState(false);

  const fetchExpenses = async () => {
    if (!userEmail) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/expenses`, { params: { userEmail } });
      setExpenses(res.data);
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [userEmail]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.amount || !form.date) return;

    const payload = {
      category: form.category,
      amount: parseFloat(form.amount),
      date: form.date,
      notes: form.notes,
      paid: form.paid,
    };

    try {
      if (isEditing) {
        await axios.put(`${API_BASE_URL}/api/expenses/${form.id}`, payload, {
          headers: { "X-User-Email": userEmail },
        });
      } else {
        await axios.post(`${API_BASE_URL}/api/expenses`, payload, {
          headers: { "X-User-Email": userEmail },
        });
      }
      setForm({ id: null, category: "", amount: "", date: "", notes: "", paid: false });
      setIsEditing(false);
      fetchExpenses();
    } catch (err) {
      console.error("Failed to save expense:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/expenses/${id}`, { headers: { "X-User-Email": userEmail } });
      fetchExpenses();
    } catch (err) {
      console.error("Failed to delete expense:", err);
    }
  };

  const handleEdit = (exp) => {
    setForm({ ...exp, amount: exp.amount.toString() });
    setIsEditing(true);
  };

  const handleTogglePaid = async (exp) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/expenses/${exp.id}`,
        { ...exp, paid: !exp.paid },
        { headers: { "X-User-Email": userEmail } }
      );
      fetchExpenses();
    } catch (err) {
      console.error("Failed to toggle paid:", err);
    }
  };

  const total = expenses.filter((exp) => !exp.paid).reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="flex flex-col items-center px-4 py-6 space-y-6 w-full max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">💰 Expense Tracker</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full bg-white dark:bg-white/5 shadow p-6 rounded-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Category"
            className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <input
            type="number"
            step="0.01"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="Amount"
            className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <input
            type="text"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Notes (optional)"
            className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>

        {isEditing && (
          <div className="flex items-center gap-2">
            <input type="checkbox" name="paid" checked={form.paid} onChange={handleChange} />
            <label className="text-gray-700 dark:text-gray-300">Mark as Paid</label>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            {isEditing ? "✏️ Update Expense" : "➕ Add Expense"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Expense Table */}
      <div className="w-full overflow-x-auto">
        <table className="min-w-full text-left bg-white dark:bg-white/5 shadow rounded-xl">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="p-2 text-gray-900 dark:text-white">#</th>
              <th className="p-2 text-gray-900 dark:text-white">Date</th>
              <th className="p-2 text-gray-900 dark:text-white">Category</th>
              <th className="p-2 text-gray-900 dark:text-white">Notes</th>
              <th className="p-2 text-gray-900 dark:text-white">Amount</th>
              <th className="p-2 text-gray-900 dark:text-white">Paid</th>
              <th className="p-2 text-gray-900 dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length > 0 ? (
              [...expenses]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((exp, index) => (
                  <tr key={exp.id} className="border-b dark:border-gray-700">
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2">{new Date(exp.date).toLocaleDateString()}</td>
                    <td className="p-2">{exp.category}</td>
                    <td className="p-2">{exp.notes || "-"}</td>
                    <td className="p-2">₹{exp.amount.toFixed(2)}</td>
                    <td className="p-2 text-center">
                      <input type="checkbox" checked={exp.paid} onChange={() => handleTogglePaid(exp)} />
                    </td>
                    <td className="p-2 space-x-2">
                      <button
                        onClick={() => handleEdit(exp)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No expenses recorded yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div className="w-full p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl font-semibold text-gray-900 dark:text-white text-center">
        📊 Total Unpaid Expenses: ₹{total.toFixed(2)}
      </div>
    </div>
  );
}
