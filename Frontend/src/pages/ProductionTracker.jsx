// src/components/ProductionTracker.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getCurrentUser } from "../utils/login";
import { apiClient } from "../utils/apiClient";
import TableCard from "../components/TableCard";
import Tooltip from "./../components/Tooltip";

export default function ProductionTracker({ onDataUpdate }) {
  const [flocks, setFlocks] = useState([]);
  const [productions, setProductions] = useState([]);
  const [form, setForm] = useState({ id: null, flockId: "", count: "", date: "" });

  const userEmail = getCurrentUser();

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

  const totalEggs = productions.reduce((sum, p) => sum + p.count, 0);
  const todayEggs = productions
    .filter(p => p.date === new Date().toISOString().split("T")[0])
    .reduce((sum, p) => sum + p.count, 0);

  return (
    <motion.div 
      className="max-w-7xl mx-auto px-6 py-12 space-y-8" 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6 }}
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-6 text-center md:text-left">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-shrink-0 inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl shadow-lg"
        >
          <span className="text-4xl">💰</span>
        </motion.div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Revenue Management Center
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
            Track and analyze all income sources from your poultry operations with detailed insights
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-effect rounded-2xl p-6 text-center"
        >
          <div className="text-3xl mb-2">🥚</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{todayEggs}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Eggs Today</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-effect rounded-2xl p-6 text-center"
        >
          <div className="text-3xl mb-2">📊</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalEggs}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Total Eggs</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-effect rounded-2xl p-6 text-center"
        >
          <div className="text-3xl mb-2">🐔</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{flocks.length}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Active Flocks</div>
        </motion.div>
      </div>

      {/* Production Entry Form */}
      <motion.form 
        onSubmit={handleSubmit} 
        className="glass-effect rounded-3xl p-8 shadow-xl border border-white/20 dark:border-slate-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
            <span className="text-2xl">{form.id ? "✏️" : "➕"}</span>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
              {form.id ? "Update Production Record" : "Record Egg Production"}
            </h2>
            <p className="text-slate-600 dark:text-slate-400">Track daily egg collection from your flocks</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <span className="text-lg">🐔</span>
              Select Flock
              <Tooltip text="Choose the flock for which you are recording egg production" />
            </label>
            <select 
              name="flockId" 
              value={form.flockId} 
              onChange={handleChange} 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Choose a flock...</option>
              {flocks.map(f => (
                <option key={f.id} value={f.id}>
                  {f.birdType === "Other" ? f.customBird : f.birdType} ({f.numBirds} birds)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <span className="text-lg">🥚</span>
              Egg Count
              <Tooltip text="Enter the total number of eggs collected from this flock" />
            </label>
            <input 
              type="number" 
              name="count" 
              value={form.count} 
              onChange={handleChange} 
              placeholder="Number of eggs"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <span className="text-lg">📅</span>
              Collection Date
              <Tooltip text="Select the date when these eggs were collected" />
            </label>
            <input 
              type="date" 
              name="date" 
              value={form.date} 
              onChange={handleChange} 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <motion.button 
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:from-emerald-700 hover:to-green-700"
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">{form.id ? "✏️" : "➕"}</span>
              {form.id ? "Update Record" : "Add Production"}
            </span>
          </motion.button>
          {form.id && (
            <motion.button 
              type="button" 
              onClick={resetForm}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors"
            >
              Cancel Edit
            </motion.button>
          )}
        </div>
      </motion.form>

      {/* Productions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <TableCard className="glass-effect rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden p-0">
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">📋</span>
              </div>
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Production History</h2>
            </div>
            <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
              {productions.length} {productions.length === 1 ? 'Record' : 'Records'}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Flock</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Egg Count</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                <AnimatePresence>
                  {productions.length ? (
                    [...productions].sort((a, b) => new Date(b.date) - new Date(a.date)).map((prod, index) => {
                      const flock = flocks.find(f => f.id === prod.flockId);
                      return (
                        <motion.tr 
                          key={prod.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="px-6 py-4 text-slate-900 dark:text-slate-100 font-medium">
                            {new Date(prod.date).toLocaleDateString('en-US', { 
                              weekday: 'short',
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">
                                {flock?.birdType === "Broiler" ? "🍗" : flock?.birdType === "Layer" ? "🥚" : "🦆"}
                              </span>
                              <span className="text-slate-900 dark:text-slate-100 font-medium">
                                {flock ? (flock.birdType === "Other" ? flock.customBird : flock.birdType) : "Unknown Flock"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{prod.count}</span>
                              <span className="text-sm text-slate-500 dark:text-slate-400">eggs</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <motion.button 
                                onClick={() => handleEdit(prod)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium shadow-sm"
                              >
                                Edit
                              </motion.button>
                              <motion.button 
                                onClick={() => handleDelete(prod.id)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium shadow-sm"
                              >
                                Delete
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center">
                        <div className="space-y-3">
                          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                            <span className="text-3xl">🥚</span>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 font-medium">No production records yet</p>
                          <p className="text-sm text-slate-400 dark:text-slate-500">Start recording your daily egg collection to track productivity</p>
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