import { useEffect, useState } from "react";
import { apiClient } from "../utils/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import TableCard from "../components/TableCard";
import DataTable from "../components/DataTable";
import Tooltip from "../components/Tooltip";

export default function FlockManagement() {
  const [flocks, setFlocks] = useState([]);
  const [newFlock, setNewFlock] = useState({ birdType: "Broiler", customBird: "", numBirds: "", age: "" });
  const [editingId, setEditingId] = useState(null);
  const [editedFlock, setEditedFlock] = useState({ birdType: "Broiler", customBird: "", numBirds: "", age: "" });
  const [loading, setLoading] = useState(true);

  const fetchFlocks = async () => {
    setLoading(true);
    try {
      const res = await apiClient.flocks.getAll();
      setFlocks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch flocks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlocks();
  }, []);

  const handleAddFlock = async () => {
    const payload = {
      birdType: newFlock.birdType,
      customBird: newFlock.birdType === "Other" ? newFlock.customBird : null,
      numBirds: parseInt(newFlock.numBirds, 10) || 0,
      age: parseInt(newFlock.age, 10) || 0,
    };
    if (!payload.birdType || payload.numBirds <= 0 || payload.age < 0) return alert("Please fill valid flock details.");
    try {
      await apiClient.flocks.save(payload);
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
      await apiClient.flocks.delete(id);
      fetchFlocks();
    } catch (err) {
      console.error("Failed to delete flock:", err);
    }
  };

  const startEditing = (flock) => {
    setEditingId(flock.id);
    setEditedFlock({ birdType: flock.birdType, customBird: flock.customBird || "", numBirds: flock.numBirds, age: flock.age });
  };
  
  const cancelEdit = () => {
    setEditingId(null);
    setEditedFlock({ birdType: "Broiler", customBird: "", numBirds: "", age: "" });
  };
  
  const handleUpdate = async () => {
    const payload = {
      birdType: editedFlock.birdType,
      customBird: editedFlock.birdType === "Other" ? editedFlock.customBird : null,
      numBirds: parseInt(editedFlock.numBirds, 10) || 0,
      age: parseInt(editedFlock.age, 10) || 0,
    };
    if (!payload.birdType || payload.numBirds <= 0 || payload.age < 0) return alert("Please fill valid flock details.");
    try {
      await apiClient.flocks.update(editingId, payload);
      cancelEdit();
      fetchFlocks();
    } catch (err) {
      console.error("Failed to update flock:", err);
    }
  };

  const totalBirds = flocks.reduce((sum, flock) => sum + flock.numBirds, 0);
  const formState = editingId ? editedFlock : newFlock;
  const setFormState = editingId ? setEditedFlock : setNewFlock;
  const handleFormSubmit = editingId ? handleUpdate : handleAddFlock;
  const buttonText = editingId ? "Update Flock" : "Add Flock";

  const columns = [
    {
      header: "Species & Type",
      key: "birdType",
      render: (item) => (
        <div className="flex items-center gap-3">
          <span className="text-lg">{item.birdType === "Broiler" ? "🐔" : item.birdType === "Layer" ? "🥚" : "🦃"}</span>
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              {item.birdType === "Other" ? item.customBird || "Other" : item.birdType}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {item.birdType === "Broiler" ? "Meat" : item.birdType === "Layer" ? "Egg" : "Custom"}
            </div>
          </div>
        </div>
      ),
    },
    { header: "Flock Size", key: "numBirds", render: (item) => `${item.numBirds} birds` },
    { header: "Age", key: "age", render: (item) => `${item.age} weeks` },
  ];

  return (
    <motion.div
      className="min-h-screen bg-light-bg dark:bg-dark-bg py-8 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader
          icon="🐓"
          title="Flock Management Center"
          description="Efficiently manage your poultry flocks with comprehensive tracking and monitoring tools"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <StatCard icon="🐣" label="Total Birds" value={totalBirds} />
          <StatCard icon="📈" label="Active Flocks" value={flocks.length} />
        </div>

        <motion.div
          className="max-w-6xl mx-auto glass-effect rounded-3xl p-8 shadow-xl border border-white/20 dark:border-slate-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-6">
            {editingId ? "Edit Flock" : "Add New Flock"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <span className="text-lg">🐔</span>
                Bird Species
                <Tooltip text="Select the type of poultry: Broiler for meat, Layer for eggs, or specify a custom species" />
              </label>
              <select 
                value={formState.birdType} 
                onChange={(e) => setFormState({ ...formState, birdType: e.target.value })} 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary focus:border-transparent transition-all"
              >
                <option value="Broiler">🐔 Broiler</option>
                <option value="Layer">🥚 Layer</option>
                <option value="Other">🦃 Other</option>
              </select>
              {formState.birdType === "Other" && (
                <input 
                  type="text" 
                  value={formState.customBird} 
                  onChange={(e) => setFormState({ ...formState, customBird: e.target.value })} 
                  placeholder="Species name" 
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100"
                />
              )}
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <span className="text-lg">📈</span>
                Flock Size
                <Tooltip text="Enter the total number of birds in this flock" />
              </label>
              <input 
                type="number" 
                value={formState.numBirds} 
                onChange={(e) => setFormState({ ...formState, numBirds: e.target.value })} 
                placeholder="Number of birds" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <span className="text-lg">📅</span>
                Age (Weeks)
                <Tooltip text="Current age of the flock in weeks" />
              </label>
              <input 
                type="number" 
                value={formState.age} 
                onChange={(e) => setFormState({ ...formState, age: e.target.value })} 
                placeholder="Age in weeks" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="flex justify-end gap-3">
              <motion.button 
                onClick={handleFormSubmit} 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }} 
                className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl shadow-lg"
              >
                {buttonText}
              </motion.button>
              {editingId && (
                <motion.button 
                  onClick={cancelEdit} 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }} 
                  className="w-full md:w-auto px-6 py-3 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-xl"
                >
                  Cancel Edit
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        <TableCard
          icon="📋"
          title="Active Flocks"
          badge={
            <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
              {flocks.length} {flocks.length === 1 ? 'Flock' : 'Flocks'}
            </div>
          }
        >
          <DataTable
            isLoading={loading}
            data={flocks}
            columns={columns}
            onEdit={startEditing}
            onDelete={handleDelete}
          >
            <div className="space-y-3">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">🐔</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">No flocks registered yet</p>
            </div>
          </DataTable>
        </TableCard>
      </div>
    </motion.div>
  );
}