import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "../utils/apiClient";
import PageHeader from "../components/PageHeader";
import TableCard from "../components/TableCard";
import DataTable from "../components/DataTable";
import StatCard from "../components/StatCard";
import Tooltip from "../components/Tooltip";

const inputStyle = "w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary focus:border-transparent transition-all";
const selectStyle = inputStyle;

export default function FeedPredictor() {
  const [form, setForm] = useState({
    birdType: "Broiler",
    customBird: "",
    numBirds: "",
    totalFeedGiven: "",
    feedUnit: "kg",
    daysLasted: "1",
    resultUnit: "kg",
  });
  const [result, setResult] = useState(null);
  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await apiClient.feedRecords.getAll();
      const rows = Array.isArray(res?.data) ? res.data : [];
      const processed = rows.map((r) => {
        const totalFeed = Number(r.totalFeedGiven || 0);
        const days = Number(r.daysLasted || 1) || 1;
        const birds = Number(r.numBirds || 1) || 1;
        const feedPerDay = totalFeed / days;
        const feedPerBird = feedPerDay / birds;
        return { ...r, feedPerDay, feedPerBird };
      });
      setRecords(processed);
    } catch (err) {
      console.error("Error fetching records:", err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const calculateResult = () => {
    if (!form.numBirds || !form.totalFeedGiven || !form.daysLasted) return;
    let total = parseFloat(form.totalFeedGiven || 0);
    if (form.feedUnit === "kg") total *= 1000;
    const days = parseFloat(form.daysLasted || 1) || 1;
    const numBirds = parseFloat(form.numBirds || 1) || 1;

    const perDay = total / days;
    const perBird = perDay / numBirds;

    if (form.resultUnit === "kg") {
      setResult({
        perBird: +(perBird / 1000).toFixed(3),
        total: +(perDay / 1000).toFixed(3),
        unit: "kg",
      });
    } else {
      setResult({
        perBird: +perBird.toFixed(2),
        total: +perDay.toFixed(0),
        unit: "g",
      });
    }
  };

  const resetForm = () => {
    setForm({
      birdType: "Broiler",
      customBird: "",
      numBirds: "",
      totalFeedGiven: "",
      feedUnit: "kg",
      daysLasted: "1",
      resultUnit: "kg",
    });
    setResult(null);
    setEditingId(null);
  };

  const saveRecord = async () => {
    const payload = {
      birdName:
        form.birdType === "Other" ? form.customBird || "Other" : form.birdType,
      numBirds: parseInt(form.numBirds, 10) || 0,
      totalFeedGiven: parseFloat(form.totalFeedGiven) || 0,
      daysLasted: parseInt(form.daysLasted, 10) || 1,
    };
    try {
      if (editingId) await apiClient.feedRecords.update(editingId, payload);
      else await apiClient.feedRecords.save(payload);
      await fetchRecords();
      resetForm();
    } catch (err) {
      console.error("Error saving record:", err);
      alert("Failed to save feed record.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this feed record?")) return;
    try {
      await apiClient.feedRecords.delete(id);
      await fetchRecords();
    } catch (err) {
      console.error("Error deleting record:", err);
      alert("Failed to delete record.");
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id || record._id || null);
    setForm({
      birdType:
        record.birdName === "Broiler" || record.birdName === "Layer"
          ? record.birdName
          : "Other",
      customBird:
        record.birdName !== "Broiler" && record.birdName !== "Layer"
          ? record.birdName
          : "",
      numBirds: record.numBirds?.toString() || "",
      totalFeedGiven: record.totalFeedGiven?.toString() || "",
      daysLasted: record.daysLasted?.toString() || "1",
      resultUnit: form.resultUnit,
      feedUnit: form.feedUnit,
    });
  };

  const totalRecords = records.length;

  const columns = [
    {
      header: "ID",
      key: "id",
      render: (item) => <span>#{item.id ?? item._id ?? "—"}</span>,
    },
    {
      header: "Species",
      key: "birdName",
      render: (item) => <span className="capitalize font-medium">{item.birdName}</span>,
    },
    {
      header: "Flock Size",
      key: "numBirds",
      render: (item) => <span>{item.numBirds} birds</span>
    },
    {
      header: "Per Bird/Day",
      key: "feedPerBird",
      render: (item) => {
        const feedPerBird = item.feedPerBird ?? 0;
        if (form.resultUnit === "kg") {
          return <span className="font-medium text-blue-600 dark:text-blue-400">{feedPerBird.toFixed(3)} kg</span>;
        } else {
          const feedInGrams = feedPerBird * 1000; // Convert kg to grams
          return <span className="font-medium text-blue-600 dark:text-blue-400">{feedInGrams.toFixed(1)} g</span>;
        }
      },
    },
    {
      header: "Total/Day",
      key: "feedPerDay",
      render: (item) => {
        const feedPerDay = item.feedPerDay ?? 0;
        if (form.resultUnit === "kg") {
          return <span className="font-medium text-green-600 dark:text-green-400">{feedPerDay.toFixed(3)} kg</span>;
        } else {
          const feedInGrams = feedPerDay * 1000; // Convert kg to grams
          return <span className="font-medium text-green-600 dark:text-green-400">{feedInGrams.toFixed(0)} g</span>;
        }
      },
    },
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
          icon={"🌾"}
          title="Intelligent Feed Predictor"
          description="Calculate optimal feed requirements and predict consumption patterns for your poultry flocks"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <StatCard icon={"📊"} label="Total Records" value={totalRecords} />
        </div>

        <motion.div
          className="max-w-6xl mx-auto glass-effect rounded-3xl p-8 shadow-xl border border-white/20 dark:border-slate-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-6">
            Feed Consumption Calculator
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <span className="text-lg">🐔</span>Bird Species
                <Tooltip text="Select the type of poultry for accurate feed calculations" />
              </label>
              <select
                name="birdType"
                value={form.birdType}
                onChange={handleChange}
                className={selectStyle}
              >
                <option value="Broiler">Broiler</option>
                <option value="Layer">Layer</option>
                <option value="Other">Other</option>
              </select>
              {form.birdType === "Other" && (
                <input
                  type="text"
                  name="customBird"
                  value={form.customBird}
                  onChange={handleChange}
                  placeholder="Enter species name"
                  className={`mt-2 ${inputStyle}`}
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <span className="text-lg">📈</span>Flock Size
                <Tooltip text="Total number of birds in your flock" />
              </label>
              <input
                type="number"
                name="numBirds"
                value={form.numBirds}
                onChange={handleChange}
                placeholder="Number of birds"
                className={inputStyle}
              />
            </div>
            {/* FIXED Feed Amount Section - Proper spacing */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <span className="text-lg">⚖️</span>Feed Amount
                <Tooltip text="Total amount of feed provided to the flock" />
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="totalFeedGiven"
                  value={form.totalFeedGiven}
                  onChange={handleChange}
                  placeholder="Enter amount"
                  min="0"
                  step="0.1"
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary focus:border-transparent transition-all"
                  required
                />
                <select
                  name="feedUnit"
                  value={form.feedUnit}
                  onChange={handleChange}
                  className="w-20 px-2 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary focus:border-transparent transition-all"
                  title="Feed unit"
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <span className="text-lg">📅</span>Duration (Days)
                <Tooltip text="Number of days the feed lasted" />
              </label>
              <input
                type="number"
                name="daysLasted"
                value={form.daysLasted}
                onChange={handleChange}
                placeholder="Days"
                className={inputStyle}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <span className="text-lg">📏</span>Result Unit
                <Tooltip text="Choose the unit for displaying results" />
              </label>
              <select
                name="resultUnit"
                value={form.resultUnit}
                onChange={handleChange}
                className={selectStyle}
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="g">Grams (g)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-8">
            <motion.button
              onClick={calculateResult}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg"
            >
              Calculate
            </motion.button>

            <motion.button
              onClick={saveRecord}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl shadow-lg"
            >
              {editingId ? "Update Record" : "Save Record"}
            </motion.button>

            {editingId && (
              <motion.button
                onClick={resetForm}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-xl"
              >
                Cancel Edit
              </motion.button>
            )}
          </div>

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-8 p-6 bg-green-100/50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800"
              >
                <h3 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-4">
                  Feed Calculation Results
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StatCard
                    icon={"🐔"}
                    label="Per Bird / Day"
                    value={`${result.perBird} ${result.unit}`}
                  />
                  <StatCard
                    icon={"📦"}
                    label="Total / Day"
                    value={`${result.total} ${result.unit}`}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <TableCard
          icon={"📋"}
          title="Feed Records History"
          badge={
            <div className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-full text-sm font-medium">
              {records.length} {records.length === 1 ? "Record" : "Records"}
            </div>
          }
        >
          <DataTable
            isLoading={loading}
            data={records}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
          >
            <div className="space-y-3">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">🌿</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">No feed records found</p>
            </div>
          </DataTable>
        </TableCard>
      </div>
    </motion.div>
  );
}