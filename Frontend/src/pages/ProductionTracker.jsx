// src/components/ProductionTracker.jsx
import { useState, useEffect } from "react";
import { getCurrentUser } from "../utils/login";
import { api } from "../utils/api";

export default function ProductionTracker({ onDataUpdate }) {
  const [flocks, setFlocks] = useState([]);
  const [productions, setProductions] = useState([]);
  const [form, setForm] = useState({ id: null, flockId: "", count: "", date: "" });

  const userEmail = getCurrentUser();

  const loadData = async () => {
    if (!userEmail) return;
    try {
      const [flockRes, prodRes] = await Promise.all([
        api.get("/flocks", { headers: { "X-User-Email": userEmail } }),
        api.get("/eggs", { headers: { "X-User-Email": userEmail } }),
      ]);

      setFlocks(flockRes.data || []);
      setProductions(prodRes.data || []);

      // daily total callback
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

    const payload = { 
      flockId: parseInt(form.flockId), 
      count: parseInt(form.count), 
      date: form.date 
    };

    try {
      if (form.id) {
        await api.put(`/eggs/${form.id}`, payload, { headers: { "X-User-Email": userEmail } });
      } else {
        await api.post("/eggs", payload, { headers: { "X-User-Email": userEmail } });
      }
      resetForm();
      await loadData();
    } catch (err) {
      console.error("Error saving production:", err);
    }
  };

  const handleEdit = (prod) => {
    setForm({ 
      id: prod.id, 
      flockId: prod.flockId.toString(), 
      count: prod.count.toString(), 
      date: prod.date 
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await api.delete(`/eggs/${id}`, { headers: { "X-User-Email": userEmail } });
      await loadData();
    } catch (err) {
      console.error("Error deleting production:", err);
    }
  };

  const resetForm = () => setForm({ id: null, flockId: "", count: "", date: "" });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
        🥚 Egg Production Tracker
      </h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <select
          name="flockId"
          value={form.flockId}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        >
          <option value="">Select Flock</option>
          {flocks.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name} ({f.size} birds)
            </option>
          ))}
        </select>

        <input
          type="number"
          name="count"
          placeholder="Egg Count"
          value={form.count}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          {form.id ? "Update" : "Add"}
        </button>
      </form>

      {/* Records table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-left">Flock</th>
              <th className="border px-3 py-2">Count</th>
              <th className="border px-3 py-2">Date</th>
              <th className="border px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {productions.map((prod) => (
              <tr key={prod.id} className="hover:bg-gray-50">
                <td className="border px-3 py-2">
                  {flocks.find((f) => f.id === prod.flockId)?.name || "Unknown"}
                </td>
                <td className="border px-3 py-2 text-center">{prod.count}</td>
                <td className="border px-3 py-2 text-center">{prod.date}</td>
                <td className="border px-3 py-2 text-center space-x-2">
                  <button
                    onClick={() => handleEdit(prod)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(prod.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {productions.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  No production records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
