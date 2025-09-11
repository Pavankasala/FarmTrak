// src/pages/FeedPredictor.jsx
import { useState, useEffect } from "react";
import { apiClient } from "../utils/apiClient";
import { getCurrentUser } from "../utils/login";
import { motion, AnimatePresence } from "framer-motion";

function Tooltip({ text }) {
  return (
    <span className="relative group cursor-pointer ml-1">
      ℹ️
      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 
        bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 
        transition pointer-events-none z-10">
        {text}
      </span>
    </span>
  );
}

export default function FeedPredictor() {
  const userEmail = getCurrentUser();
  const [flocks, setFlocks] = useState([]);
  const [selectedFlockId, setSelectedFlockId] = useState("");
  const [predictedFeed, setPredictedFeed] = useState(null);
  const [savedRecords, setSavedRecords] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.getFlocks();
        setFlocks(res.data || []);
        const recs = await apiClient.getFeedRecords();
        setSavedRecords(recs.data || []);
      } catch (err) {
        console.error("Error loading feed data:", err);
      }
    };
    load();
  }, []);

  const handlePredict = () => {
    if (!selectedFlockId) return alert("Please select a flock");
    // Simple deterministic calculation for predict demo
    const pred = (Math.random() * 2 + 0.5).toFixed(2); // kg per bird/day sample
    setPredictedFeed(pred);
  };

  const handleSaveRecord = async () => {
    if (!predictedFeed || !selectedFlockId) return alert("Predict first");
    const payload = {
      flockId: selectedFlockId,
      predictedFeed: parseFloat(predictedFeed),
      date: new Date().toISOString().split("T")[0],
      userEmail,
    };
    try {
      const res = await apiClient.saveFeedRecord(payload);
      setSavedRecords([res.data, ...savedRecords]);
      setPredictedFeed(null);
      setSelectedFlockId("");
    } catch (err) {
      console.error("Error saving feed record:", err);
      alert("Failed to save prediction");
    }
  };

  return (
    <div className="flex flex-col items-center px-4 py-6 space-y-6 w-full max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🐔 Feed Predictor</h1>

      <motion.div className="w-full bg-white dark:bg-white/5 p-6 rounded-2xl shadow space-y-6"
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 250, damping: 20 }}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Select Flock <Tooltip text="Choose a flock to predict feed consumption" />
        </label>
        <select value={selectedFlockId} onChange={(e)=>setSelectedFlockId(e.target.value)} className="w-full border rounded p-2 dark:bg-gray-800 dark:text-white">
          <option value="">-- Select Flock --</option>
          {flocks.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>

        <div className="flex gap-2">
          <button onClick={handlePredict} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded shadow">Predict Feed</button>
          <button onClick={handleSaveRecord} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded shadow">Save Record</button>
        </div>

        {predictedFeed && <div className="mt-4 text-lg font-semibold">Predicted Feed: <span className="text-blue-700">{predictedFeed} kg</span></div>}
      </motion.div>

      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">📋 Saved Predictions</h2>
      <div className="overflow-x-auto w-full">
        <table className="min-w-full bg-white dark:bg-white/5 rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-left text-gray-600 dark:text-gray-300 text-sm uppercase">
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Flock</th>
              <th className="px-4 py-2">Predicted Feed (kg)</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {savedRecords.length > 0 ? savedRecords.map(rec => (
                <motion.tr key={rec.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2">{rec.date}</td>
                  <td className="px-4 py-2">{rec.flockId}</td>
                  <td className="px-4 py-2">{rec.predictedFeed}</td>
                  <td className="px-4 py-2">
                    {/* Optionally add edit/delete using apiClient.updateFeedRecord/deleteFeedRecord */}
                  </td>
                </motion.tr>
              )) : <tr><td colSpan="4" className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">No predictions saved yet</td></tr>}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
