// src/components/ProductionTracker.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getCurrentUser } from "../utils/login";
import { apiClient } from "../utils/apiClient";
import TableCard from "../components/TableCard";
import Tooltip from "./../components/Tooltip";

export default function ProductionTracker({ onDataUpdate }) {
  const [flocks, setFlocks] = useState([]);
  const [productions, setProductions] = useState([]);
  const [form, setForm] = useState({ id: null, flockId: "", count: "", date: "" });

  const userEmail = getCurrentUser();
  const baseBtn = "px-4 py-2 rounded text-white font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2";

  // Load flocks and productions
  const loadData = async () => {
    if (!userEmail) return;
    try {
      const [flockRes, prodRes] = await Promise.all([
        apiClient.getFlocks(),
        apiClient.getEggProductions(),
      ]);
      const flocksData = flockRes.data || [];
      const productionsData = prodRes.data || [];

      setFlocks(flocksData);
      setProductions(productionsData);

      const today = new Date().toISOString().split("T")[0];
      const totalToday = productionsData
        .filter(p => p.date.startsWith(today))
        .reduce((sum, p) => sum + Number(p.count), 0);
      onDataUpdate?.({ eggsToday: totalToday });
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  useEffect(() => {
    if (userEmail) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const resetForm = () => setForm({ id: null, flockId: "", count: "", date: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.flockId || !form.count || !form.date) return alert("Please fill all fields");

    const payload = { flockId: Number(form.flockId), count: Number(form.count), date: form.date };
    try {
      if (form.id) await apiClient.updateEggProduction(form.id, payload);
      else await apiClient.saveEggProduction(payload);

      resetForm();
      await loadData();
    } catch (err) {
      console.error("Error saving production:", err);
      alert("Failed to save production");
    }
  };

  const handleEdit = (prod) => {
    setForm({ id: prod.id, flockId: prod.flockId.toString(), count: prod.count.toString(), date: prod.date });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await apiClient.deleteEggProduction(id);
      await loadData();
    } catch (err) {
      console.error("Error deleting production:", err);
      alert("Failed to delete production");
    }
  };

  return (
    <motion.div className="max-w-5xl mx-auto px-4 py-10 space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">🥚 Egg Production Tracker</h1>

      {/* Form */}
      <motion.form onSubmit={handleSubmit} className="bg-white dark:bg-white/5 shadow-inner p-6 rounded-2xl space-y-6 transition-colors">
        <div className="bg-white/10 dark:bg-gray-800 p-4 rounded-2xl shadow-inner space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Flock <Tooltip text="Select the flock for which you are recording egg production." />
              </label>
              <select name="flockId" value={form.flockId} onChange={handleChange} className="w-full border p-2 rounded dark:bg-gray-800 dark:text-white">
                <option value="">Select Flock</option>
                {flocks.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.birdType === "Other" ? f.customBird : f.birdType} ({f.numBirds} birds)
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Egg Count <Tooltip text="Enter the number of eggs collected for the selected flock." />
              </label>
              <input type="number" name="count" value={form.count} onChange={handleChange} placeholder="Egg Count" className="w-full border p-2 rounded dark:bg-gray-800 dark:text-white" />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date <Tooltip text="Pick the date for which this egg production record applies." />
              </label>
              <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full border p-2 rounded dark:bg-gray-800 dark:text-white" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="submit" className={`${baseBtn} bg-green-600 hover:bg-green-700 focus:ring-green-400`}>{form.id ? "✏️ Update" : "➕ Add"}</button>
            {form.id && <button type="button" onClick={resetForm} className={`${baseBtn} bg-gray-500 hover:bg-gray-600 focus:ring-gray-400`}>Cancel</button>}
          </div>
        </div>
      </motion.form>

      {/* Productions Table */}
      <TableCard className="overflow-x-auto mt-6">
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
            {productions.length ? (
              [...productions].sort((a, b) => new Date(b.date) - new Date(a.date)).map(p => {
                const flock = flocks.find(f => f.id === p.flockId);
                return (
                  <tr key={p.id} className="border-b dark:border-gray-700">
                    <td className="p-2">{p.date}</td>
                    <td className="p-2">{flock ? (flock.birdType === "Other" ? flock.customBird : flock.birdType) : "-"}</td>
                    <td className="p-2">{p.count}</td>
                    <td className="p-2 flex gap-2 flex-wrap">
                      <button onClick={() => handleEdit(p)} className={`${baseBtn} bg-yellow-500 hover:bg-yellow-600`}>Edit</button>
                      <button onClick={() => handleDelete(p.id)} className={`${baseBtn} bg-red-600 hover:bg-red-700`}>Delete</button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500 dark:text-gray-400">No production records yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </TableCard>
    </motion.div>
  );
}
