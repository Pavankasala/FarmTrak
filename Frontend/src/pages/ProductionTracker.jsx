import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { apiClient } from "../utils/apiClient";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import TableCard from "../components/TableCard";
import DataTable from "../components/DataTable";
import Tooltip from "../components/Tooltip";

const inputStyle = "w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary focus:border-transparent transition-all";
const selectStyle = inputStyle;

export default function ProductionTracker() {
  const [flocks, setFlocks] = useState([]);
  const [productions, setProductions] = useState([]);
  const [form, setForm] = useState({ id: null, flockId: "", count: "", date: new Date().toISOString().split("T")[0] });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [flockRes, prodRes] = await Promise.all([apiClient.flocks.getAll(), apiClient.eggs.getAll()]);
      setFlocks(flockRes.data || []);
      setProductions(prodRes.data || []);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const resetForm = () => setForm({ id: null, flockId: "", count: "", date: new Date().toISOString().split("T")[0] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.flockId || !form.count || !form.date) {
      return alert("Please fill all fields");
    }
    const eggCount = Number(form.count);
    if (eggCount <= 0) {
      return alert("Egg count must be a positive number.");
    }

    const payload = { flockId: Number(form.flockId), count: eggCount, date: form.date };
    try {
      if (form.id) await apiClient.eggs.update(form.id, payload);
      else await apiClient.eggs.save(payload);
      resetForm();
      await loadData();
    } catch (err) {
      console.error("Error saving production:", err);
    }
  };

  const handleEdit = (prod) => setForm({ id: prod.id, flockId: prod.flockId.toString(), count: prod.count.toString(), date: prod.date });

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await apiClient.eggs.delete(id);
      await loadData();
    } catch (err) {
      console.error("Error deleting production:", err);
    }
  };

  const totalEggs = productions.reduce((sum, p) => sum + p.count, 0);
  const todayEggs = productions
    .filter(p => p.date === new Date().toISOString().split("T")[0])
    .reduce((sum, p) => sum + p.count, 0);

  const columns = [
    { header: "Date", key: "date", render: (item) => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) },
    {
      header: "Flock",
      key: "flockId",
      render: (item) => {
        const flock = flocks.find(f => f.id === item.flockId);
        return flock ? (
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">{flock.birdType === "Other" ? flock.customBird : flock.birdType}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{flock.numBirds} birds</p>
          </div>
        ) : "Unknown";
      }
    },
    { header: "Egg Count", key: "count" },
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
          icon="🥚"
          title="Egg Production Tracker"
          description="Monitor and record daily egg production across all your flocks with detailed analytics"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <StatCard icon="🥚" label="Eggs Today" value={todayEggs} />
          <StatCard icon="📈" label="Total Eggs Recorded" value={totalEggs} />
          <StatCard icon="🐔" label="Active Flocks" value={flocks.length} />
        </div>

        <motion.form
          onSubmit={handleSubmit}
          className="max-w-6xl mx-auto glass-effect rounded-3xl p-8 shadow-xl border border-white/20 dark:border-slate-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-6">
            {form.id ? "Update Production Record" : "Record Egg Production"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <span className="text-lg">🐔</span>Select Flock<Tooltip text="Choose the flock for this egg collection record" />
              </label>
              <select name="flockId" value={form.flockId} onChange={handleChange} className={selectStyle}>
                <option value="">Choose a flock...</option>
                {flocks.map(f => <option key={f.id} value={f.id}>{f.birdType === "Other" ? f.customBird : f.birdType} ({f.numBirds} birds)</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <span className="text-lg">🥚</span>Egg Count<Tooltip text="Enter the total number of eggs collected" />
              </label>
              <input type="number" name="count" value={form.count} onChange={handleChange} placeholder="Number of eggs" className={inputStyle} min="0" />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <span className="text-lg">📅</span>Collection Date<Tooltip text="Select the date of collection" />
              </label>
              <input type="date" name="date" value={form.date} onChange={handleChange} className={inputStyle} />
            </div>
          </div>
          <div className="flex gap-3">
            <motion.button 
              type="submit" 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }} 
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl shadow-lg"
            >
              {form.id ? "Update Record" : "Add Production"}
            </motion.button>
            {form.id && (
              <motion.button 
                type="button" 
                onClick={resetForm} 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }} 
                className="px-6 py-3 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-xl"
              >
                Cancel Edit
              </motion.button>
            )}
          </div>
        </motion.form>

        <TableCard
          icon="📋"
          title="Production History"
          badge={
            <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
              {productions.length} {productions.length === 1 ? 'Record' : 'Records'}
            </div>
          }
        >
          <DataTable
            isLoading={loading}
            data={[...productions].sort((a, b) => new Date(b.date) - new Date(a.date))}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
          >
            <div className="space-y-3">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">🥚</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">No production records yet</p>
            </div>
          </DataTable>
        </TableCard>
      </div>
    </motion.div>
  );
}