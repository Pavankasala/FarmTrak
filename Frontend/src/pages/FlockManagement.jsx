// src/pages/FlockManagement.jsx
import { useEffect, useState } from "react";
import { apiClient } from "../utils/apiClient";
import { getCurrentUser } from "../utils/login";
import { motion, AnimatePresence } from "framer-motion";
import TableCard from "../components/TableCard";
import Tooltip from "../components/Tooltip";

export default function FlockManagement() {
  const userEmail = getCurrentUser();
  const [flocks, setFlocks] = useState([]);
  const [newFlock, setNewFlock] = useState({ birdType: "Broiler", customBird: "", numBirds: "", age: "" });
  const [editingId, setEditingId] = useState(null);
  const [editedFlock, setEditedFlock] = useState({ birdType: "Broiler", customBird: "", numBirds: "", age: "" });
  const [loading, setLoading] = useState(false);

  const fetchFlocks = async () => {
    if (!userEmail) return;
    setLoading(true);
    try {
      const res = await apiClient.getFlocks();
      setFlocks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch flocks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userEmail) fetchFlocks();
  }, [userEmail]);

  const handleAddFlock = async () => {
    if (!userEmail) return alert("User not logged in!");
    const finalBirdType = newFlock.birdType === "Other" ? "Other" : newFlock.birdType;
    const payload = {
      birdType: finalBirdType,
      customBird: newFlock.birdType === "Other" ? (newFlock.customBird || null) : null,
      numBirds: parseInt(newFlock.numBirds, 10) || 0,
      age: parseInt(newFlock.age, 10) || 0,
    };
    if (!payload.birdType || payload.numBirds <= 0 || payload.age < 0) return alert("Please fill valid flock details.");
    try {
      await apiClient.saveFlock(payload);
      setNewFlock({ birdType: "Broiler", customBird: "", numBirds: "", age: "" });
      fetchFlocks();
    } catch (err) {
      console.error("Failed to add flock:", err);
      alert("Failed to add flock.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this flock?")) return;
    try {
      await apiClient.deleteFlock(id);
      fetchFlocks();
    } catch (err) {
      console.error("Failed to delete flock:", err);
      alert("Failed to delete flock.");
    }
  };

  const startEditing = (flock) => {
    setEditingId(flock.id);
    setEditedFlock({
      birdType: flock.birdType,
      customBird: flock.customBird || "",
      numBirds: flock.numBirds,
      age: flock.age,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditedFlock({ birdType: "Broiler", customBird: "", numBirds: "", age: "" });
  };

  const handleUpdate = async () => {
    if (!userEmail) return alert("User not logged in!");
    const finalBirdType = editedFlock.birdType === "Other" ? "Other" : editedFlock.birdType;
    const payload = {
      birdType: finalBirdType,
      customBird: editedFlock.birdType === "Other" ? (editedFlock.customBird || null) : null,
      numBirds: parseInt(editedFlock.numBirds, 10) || 0,
      age: parseInt(editedFlock.age, 10) || 0,
    };
    if (!payload.birdType || payload.numBirds <= 0 || payload.age < 0) return alert("Please fill valid flock details.");
    try {
      await apiClient.updateFlock(editingId, payload);
      cancelEdit();
      fetchFlocks();
    } catch (err) {
      console.error("Failed to update flock:", err);
      alert("Failed to update flock.");
    }
  };

  return (
    <motion.div 
      className="w-full max-w-7xl mx-auto px-6 py-12 space-y-8"
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
          className="flex-shrink-0 inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-3xl shadow-lg"
        >
          <span className="text-4xl">🐔</span>
        </motion.div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Flock Management Center
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
            Efficiently manage your poultry flocks with comprehensive tracking and monitoring tools
          </p>
        </div>
      </div>

      {/* Add New Flock Form */}
      <motion.div 
        className="glass-effect rounded-3xl p-8 shadow-xl border border-white/20 dark:border-slate-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
            <span className="text-xl">➕</span>
          </div>
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Add New Flock</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <span className="text-lg">🐦</span>
              Bird Species
              <Tooltip text="Select the type of poultry: Broiler for meat production, Layer for egg production, or specify a custom species" />
            </label>
            <select
              value={newFlock.birdType}
              onChange={(e) => setNewFlock({ ...newFlock, birdType: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="Broiler">🍗 Broiler (Meat Production)</option>
              <option value="Layer">🥚 Layer (Egg Production)</option>
              <option value="Other">🦆 Other Species</option>
            </select>
            {newFlock.birdType === "Other" && (
              <input
                type="text"
                value={newFlock.customBird}
                onChange={(e) => setNewFlock({ ...newFlock, customBird: e.target.value })}
                placeholder="Enter species name (e.g., Duck, Turkey)"
                className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <span className="text-lg">📊</span>
              Flock Size
              <Tooltip text="Enter the total number of birds in this flock for accurate tracking and management" />
            </label>
            <input
              type="number"
              value={newFlock.numBirds}
              onChange={(e) => setNewFlock({ ...newFlock, numBirds: e.target.value })}
              placeholder="Number of birds"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <span className="text-lg">📅</span>
              Age (Weeks)
              <Tooltip text="Current age of the flock in weeks - important for feeding schedules and production expectations" />
            </label>
            <input
              type="number"
              value={newFlock.age}
              onChange={(e) => setNewFlock({ ...newFlock, age: e.target.value })}
              placeholder="Age in weeks"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex justify-end">
            <motion.button
              onClick={handleAddFlock}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:from-emerald-700 hover:to-green-700"
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">➕</span>
                Add Flock
              </span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Flocks Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <TableCard className="glass-effect rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
              <span className="text-xl">📋</span>
            </div>
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Active Flocks</h2>
            <div className="ml-auto px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
              {flocks.length} {flocks.length === 1 ? 'Flock' : 'Flocks'}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Species & Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Flock Size
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Age (Weeks)
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                <AnimatePresence>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-slate-600 dark:text-slate-400">Loading flocks...</span>
                        </div>
                      </td>
                    </tr>
                  ) : flocks.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center">
                        <div className="space-y-3">
                          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                            <span className="text-3xl">🐓</span>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 font-medium">No flocks registered yet</p>
                          <p className="text-sm text-slate-400 dark:text-slate-500">Add your first flock to get started with management</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    flocks.map((flock, index) =>
                      editingId === flock.id ? (
                        <motion.tr 
                          key={flock.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="bg-blue-50 dark:bg-blue-900/20"
                        >
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <select
                                value={editedFlock.birdType}
                                onChange={(e) => setEditedFlock({ ...editedFlock, birdType: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                              >
                                <option value="Broiler">🍗 Broiler</option>
                                <option value="Layer">🥚 Layer</option>
                                <option value="Other">🦆 Other</option>
                              </select>
                              {editedFlock.birdType === "Other" && (
                                <input
                                  type="text"
                                  value={editedFlock.customBird}
                                  onChange={(e) => setEditedFlock({ ...editedFlock, customBird: e.target.value })}
                                  placeholder="Species name"
                                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                                />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              value={editedFlock.numBirds}
                              onChange={(e) => setEditedFlock({ ...editedFlock, numBirds: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              value={editedFlock.age}
                              onChange={(e) => setEditedFlock({ ...editedFlock, age: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button 
                                onClick={handleUpdate} 
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                              >
                                Save
                              </button>
                              <button 
                                onClick={cancelEdit} 
                                className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm font-medium"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ) : (
                        <motion.tr 
                          key={flock.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center">
                                <span className="text-lg">
                                  {flock.birdType === "Broiler" ? "🍗" : flock.birdType === "Layer" ? "🥚" : "🦆"}
                                </span>
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 dark:text-slate-100">
                                  {flock.birdType === "Other" ? flock.customBird || "Other" : flock.birdType}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                  {flock.birdType === "Broiler" ? "Meat Production" : 
                                   flock.birdType === "Layer" ? "Egg Production" : "Custom Species"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{flock.numBirds}</span>
                              <span className="text-sm text-slate-500 dark:text-slate-400">birds</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">{flock.age}</span>
                              <span className="text-sm text-slate-500 dark:text-slate-400">weeks</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <motion.button 
                                onClick={() => startEditing(flock)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium shadow-sm"
                              >
                                Edit
                              </motion.button>
                              <motion.button 
                                onClick={() => handleDelete(flock.id)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium shadow-sm"
                              >
                                Delete
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      )
                    )
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