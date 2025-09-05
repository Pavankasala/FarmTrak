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


      const flocksData = flockRes.data || [];
      const productionsData = prodRes.data || [];

      setFlocks(flocksData);
      setProductions(productionsData);

      // Calculate today's total eggs
      const today = new Date().toISOString().split("T")[0];
      const todayRecords = productionsData.filter((p) => p.date.startsWith(today));
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

  const resetForm = () => setForm({ id: null, flockId: "", count: "", date: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.flockId || !form.count || !form.date) return;

    const payload = { flockId: parseInt(form.flockId), count: parseInt(form.count), date: form.date };

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
    setForm({ id: prod.id, flockId: prod.flockId.toString(), count: prod.count.toString(), date: prod.date });
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">🥚 Egg Production Tracker</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-light-bg dark:bg-dark-card shadow p-6 rounded-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            name="flockId"
            value={form.flockId}
            onChange={handleChange}
            className="w-full border p-2 rounded dark:bg-gray-800 dark:text-white"
          >
            <option value="">Select Flock</option>
            {flocks.map((f) => (
              <option key={f.id} value={f.id}>
                {f.birdType === "Other" ? f.customBird : f.birdType} ({f.numBirds} birds)
              </option>
            ))}
          </select>

          <input
            type="number"
            name="count"
            value={form.count}
            onChange={handleChange}
            placeholder="Egg Count"
            className="w-full border p-2 rounded dark:bg-gray-800 dark:text-white"
          />

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full border p-2 rounded dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            {form.id ? "✏️ Update" : "➕ Add"}
          </button>
          {form.id && (
            <button type="button" onClick={resetForm} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      <div className="overflow-x-auto bg-light-bg dark:bg-dark-card shadow p-4 rounded-xl">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="p-2 text-gray-900 dark:text-white">Date</th>
              <th className="p-2 text-gray-900 dark:text-white">Flock</th>
              <th className="p-2 text-gray-900 dark:text-white">Egg Count</th>
              <th className="p-2 text-gray-900 dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {productions.length > 0 ? (
              [...productions]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((p) => {
                  const flock = flocks.find((f) => f.id === p.flockId);
                  return (
                    <tr key={p.id} className="border-b dark:border-gray-700">
                      <td className="p-2 text-gray-900 dark:text-white">{p.date}</td>
                      <td className="p-2 text-gray-900 dark:text-white">{flock ? (flock.birdType === "Other" ? flock.customBird : flock.birdType) : "-"}</td>
                      <td className="p-2 text-gray-900 dark:text-white">{p.count}</td>
                      <td className="p-2 flex gap-2">
                        <button
                          onClick={() => handleEdit(p)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
            ) : (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No production records yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
