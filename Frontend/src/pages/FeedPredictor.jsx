import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "../utils/apiClient";
import { getCurrentUser } from "../utils/login";
import TableCard from "../components/TableCard";
import Tooltip from "../components/Tooltip";

export default function FeedPredictor() {
  const [birdType, setBirdType] = useState("broiler");
  const [customBird, setCustomBird] = useState("");
  const [numBirds, setNumBirds] = useState("");
  const [totalFeedGiven, setTotalFeedGiven] = useState("");
  const [feedUnit, setFeedUnit] = useState("kg");
  const [daysLasted, setDaysLasted] = useState("10");
  const [resultUnit, setResultUnit] = useState("kg");
  const [result, setResult] = useState(null);
  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const fetchRecords = async () => {
    try {
      const res = await apiClient.getFeedRecords();
      const processed = res.data.map((r) => ({
        ...r,
        feedPerDay: r.totalFeedGiven / r.daysLasted,
        feedPerBird: r.totalFeedGiven / r.numBirds / r.daysLasted,
      }));
      setRecords(processed);
    } catch (err) {
      console.error("Error fetching records:", err);
    }
  };

  const calculateResult = () => {
    if (!numBirds || !totalFeedGiven || !daysLasted) return;
    let total = parseFloat(totalFeedGiven);
    if (feedUnit === "kg") total *= 1000;
    const perDay = total / parseFloat(daysLasted);
    const perBird = perDay / parseFloat(numBirds);
    let displayTotal = perDay;
    let displayPerBird = perBird;
    if (resultUnit === "kg") {
      displayTotal /= 1000;
      displayPerBird /= 1000;
    }
    setResult({
      perBird: displayPerBird.toFixed(2),
      total: displayTotal.toFixed(2),
      unit: resultUnit,
    });
  };

  const resetForm = () => {
    setBirdType("broiler");
    setCustomBird("");
    setNumBirds("");
    setTotalFeedGiven("");
    setFeedUnit("kg");
    setDaysLasted("10");
    setResultUnit("kg");
    setResult(null);
    setEditingId(null);
  };

  const saveRecord = async () => {
    try {
      const payload = {
        birdName: birdType === "other" ? customBird : birdType,
        numBirds: parseInt(numBirds),
        totalFeedGiven: parseFloat(totalFeedGiven),
        daysLasted: parseInt(daysLasted),
      };
      if (editingId) {
        await apiClient.updateFeedRecord(editingId, payload);
      } else {
        await apiClient.saveFeedRecord(payload);
      }
      await fetchRecords();
      resetForm();
    } catch (err) {
      console.error("Error saving record:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this feed record?")) return;
    try {
      await apiClient.deleteFeedRecord(id);
      fetchRecords();
    } catch (err) {
      console.error("Error deleting record:", err);
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setBirdType(record.birdName === "broiler" || record.birdName === "layer" ? record.birdName : "other");
    setCustomBird(record.birdName !== "broiler" && record.birdName !== "layer" ? record.birdName : "");
    setNumBirds(record.numBirds);
    setTotalFeedGiven(record.totalFeedGiven);
    setFeedUnit("kg");
    setResultUnit("kg");
  };

  useEffect(() => {
    fetchRecords();
  }, []);

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
          className="flex-shrink-0 inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-3xl shadow-lg"
        >
          <span className="text-4xl">🧠</span>
        </motion.div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Intelligent Feed Predictor
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
            Calculate optimal feed requirements and predict consumption patterns for your poultry flocks
          </p>
        </div>
      </div>

      {/* Feed Calculator Form */}
      <motion.div
        className="glass-effect rounded-3xl p-8 shadow-xl border border-white/20 dark:border-slate-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🧮</span>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Feed Consumption Calculator</h2>
            <p className="text-slate-600 dark:text-slate-400">Enter your flock details to calculate feed requirements</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <span className="text-lg">🐦</span>
              Bird Species
              <Tooltip text="Select the type of poultry for accurate feed calculations" />
            </label>
            <select
              value={birdType}
              onChange={(e) => setBirdType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="broiler">🍗 Broiler Chickens</option>
              <option value="layer">🥚 Layer Hens</option>
              <option value="other">🦆 Other Species</option>
            </select>
            {birdType === "other" && (
              <input
                type="text"
                value={customBird}
                onChange={(e) => setCustomBird(e.target.value)}
                placeholder="Enter species name (e.g., Duck, Turkey)"
                className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <span className="text-lg">📊</span>
              Flock Size
              <Tooltip text="Total number of birds in your flock" />
            </label>
            <input
              type="number"
              value={numBirds}
              onChange={(e) => setNumBirds(e.target.value)}
              placeholder="Number of birds"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <span className="text-lg">⚖️</span>
              Feed Amount
              <Tooltip text="Total amount of feed provided to the flock" />
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={totalFeedGiven}
                onChange={(e) => setTotalFeedGiven(e.target.value)}
                placeholder="Amount"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <select
                value={feedUnit}
                onChange={(e) => setFeedUnit(e.target.value)}
                className="px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <span className="text-lg">📅</span>
              Duration (Days)
              <Tooltip text="Number of days the feed lasted" />
            </label>
            <input
              type="number"
              value={daysLasted}
              onChange={(e) => setDaysLasted(e.target.value)}
              placeholder="Days"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <span className="text-lg">📏</span>
              Result Unit
              <Tooltip text="Choose the unit for displaying results" />
            </label>
            <select
              value={resultUnit}
              onChange={(e) => setResultUnit(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:from-blue-700 hover:to-indigo-700"
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">🧮</span>
              Calculate Feed Requirements
            </span>
          </motion.button>
          <motion.button
            onClick={saveRecord}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:from-emerald-700 hover:to-green-700"
          >
            {editingId ? "Update Record" : "Save Record"}
          </motion.button>
          {editingId && (
            <motion.button
              onClick={resetForm}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors"
            >
              Cancel Edit
            </motion.button>
          )}
        </div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                  <span className="text-xl">✅</span>
                </div>
                <h3 className="text-xl font-semibold text-green-900 dark:text-green-100">Feed Calculation Results</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {result.perBird} {result.unit}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">Per bird per day</div>
                </div>
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {result.total} {result.unit}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">Total per day</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Saved Records Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <TableCard className="glass-effect rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden p-0">
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">📋</span>
              </div>
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Feed Records History</h2>
            </div>
            <div className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-full text-sm font-medium">
              {records.length} {records.length === 1 ? 'Record' : 'Records'}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Species</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Flock Size</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Per Bird/Day</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Total/Day</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                <AnimatePresence>
                  {records.length ? (
                    records.map((record, index) => (
                      <motion.tr
                        key={record.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-slate-900 dark:text-slate-100 font-mono text-sm">
                          #{record.id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {record.birdName === 'broiler' ? '🍗' : record.birdName === 'layer' ? '🥚' : '🦆'}
                            </span>
                            <span className="capitalize text-slate-900 dark:text-slate-100 font-medium">
                              {record.birdName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-900 dark:text-slate-100 font-semibold">
                          {record.numBirds} birds
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {record.feedPerBird.toFixed(2)} {resultUnit}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            {record.feedPerDay.toFixed(2)} {resultUnit}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <motion.button
                              onClick={() => handleEdit(record)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium shadow-sm"
                            >
                              Edit
                            </motion.button>
                            <motion.button
                              onClick={() => handleDelete(record.id)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium shadow-sm"
                            >
                              Delete
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="space-y-3">
                          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                            <span className="text-3xl">🧠</span>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 font-medium">No feed records found</p>
                          <p className="text-sm text-slate-400 dark:text-slate-500">Calculate and save your first feed record to get started</p>
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