// src/components/ProductionTracker.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { getCurrentUser } from "../utils/login";
import { API_BASE_URL } from "../utils/api";

export default function ProductionTracker({ onDataUpdate }) {
  const [flocks, setFlocks] = useState([]);
  const [productions, setProductions] = useState([]);
  const [form, setForm] = useState({ id: null, flockId: "", count: "", date: "" });

  const userEmail = getCurrentUser();

  const loadData = async () => {
    if (!userEmail) return;
    try {
      const [flockRes, prodRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/flocks`, { headers: { "X-User-Email": userEmail } }),
        axios.get(`${API_BASE_URL}/api/eggs`, { headers: { "X-User-Email": userEmail } }),
      ]);

      setFlocks(flockRes.data || []);
      setProductions(prodRes.data || []);

      // Update total eggs today
      const today = new Date().toISOString().split("T")[0];
      const todayRecords = prodRes.data.filter((p) => p.date === today);
      const totalToday = todayRecords.reduce((sum, p) => sum + p.count, 0);
      onDataUpdate?.({ eggsToday: totalToday });
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  useEffect(() => {
    if (userEmail) loadData();
  }, [userEmail]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.flockId || !form.count || !form.date) return;

    const payload = { flockId: parseInt(form.flockId), count: parseInt(form.count), date: form.date };

    try {
      if (form.id) {
        await axios.put(`${API_BASE_URL}/api/eggs/${form.id}`, payload, { headers: { "X-User-Email": userEmail } });
      } else {
        await axios.post(`${API_BASE_URL}/api/eggs`, payload, { headers: { "X-User-Email": userEmail } });
      }
      resetForm();
      await loadData();
    } catch (err) {
      console.error("Error saving production:", err);
    }
  };

  const handleEdit = (prod) => {
    setForm({ id: prod.id, flockId: prod.flockId.toString(), count: prod.count.toString(), date: prod.date });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/eggs/${id}`, { headers: { "X-User-Email": userEmail } });
      await loadData();
    } catch (err) {
      console.error("Error deleting production:", err);
    }
  };

  const resetForm = () => setForm({ id: null, flockId: "", count: "", date: "" });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">🥚 Egg Production Tracker</h1>

      {/* Add / Update Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-light-bg dark:bg-light-bg/5 p-6 rounded-2xl shadow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end transition-colors"
      >
        <select
          name="flockId"
          value={form.flockId}
          onChange={handleChange}
          className="p-2 rounded border dark:bg-gray-800 dark:text-white w-full"
        >
          <option value="">Select Flock</option>
          {flocks.map((flock) => (
            <option key={flock.id} value={flock.id}>
              {flock.type} ({flock.quantity} birds)
            </option>
          ))}
        </select>

        <input
          type="number"
          name="count"
          placeholder="Egg Count"
          value={form.count}
          onChange={handleChange}
          className="p-2 rounded border dark:bg-gray-800 dark:text-white w-full"
        />

        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="p-2 rounded border dark:bg-gray-800 dark:text-white w-full"
        />

        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded w-full sm:w-auto transition-colors"
        >
          {form.id ? "Update" : "Add"}
        </button>

        {form.id && (
          <button
            type="button"
            onClick={resetForm}
            className="bg-gray-500 hover:bg-gray-400 text-white px-4 py-2 rounded w-full sm:w-auto transition-colors"
          >
            Cancel
          </button>
        )}
      </form>

      {/* Production Records Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-light-bg dark:bg-light-bg/5 rounded-xl overflow-hidden transition-colors">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-left text-gray-600 dark:text-gray-300 text-sm uppercase">
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Flock</th>
              <th className="px-4 py-2">Eggs</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {productions.length > 0 ? (
              [...productions]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((prod, index) => {
                  const flock = flocks.find((f) => f.id === prod.flockId);
                  return (
                    <tr key={prod.id} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-2">{index + 1}</td>
                      <td className="px-4 py-2">{prod.date}</td>
                      <td className="px-4 py-2">{flock?.type || "N/A"}</td>
                      <td className="px-4 py-2">{prod.count}</td>
                      <td className="px-4 py-2 flex flex-wrap gap-2">
                        <button
                          onClick={() => handleEdit(prod)}
                          className="bg-yellow-500 hover:bg-yellow-400 text-white px-3 py-1 rounded transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id)}
                          className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
            ) : (
              <tr>
                <td colSpan="5" className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                  No production data yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
