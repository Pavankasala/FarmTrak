import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  const [resultUnit, setResultUnit] = useState("kg"); // ✅ Set default to "kg"
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
    setResultUnit("kg"); // Reset default to kg
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
      className="max-w-5xl mx-auto px-4 py-10 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center">🧠 Feed Predictor</h1>

      <TableCard title="🧠 Feed Predictor Inputs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Bird Type <Tooltip text="Select type of bird (Broiler, Layer, or Other)" />
            </label>
            <select
              value={birdType}
              onChange={(e) => setBirdType(e.target.value)}
              className="w-full p-2 border rounded-lg bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600"
            >
              <option value="broiler">Broiler</option>
              <option value="layer">Layer</option>
              <option value="other">Other</option>
            </select>
          </div>

          {birdType === "other" && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Custom Bird Name <Tooltip text="Enter the bird name if it's not Broiler or Layer" />
              </label>
              <input
                type="text"
                value={customBird}
                onChange={(e) => setCustomBird(e.target.value)}
                placeholder="Enter bird name"
                className="w-full p-2 border rounded-lg bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Number of Birds <Tooltip text="How many birds are in this flock?" />
            </label>
            <input
              type="number"
              value={numBirds}
              onChange={(e) => setNumBirds(e.target.value)}
              placeholder="Enter number of birds"
              className="w-full p-2 border rounded-lg bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Total Feed Given <Tooltip text="Amount of feed provided in total (kg or g)" />
            </label>
            <input
              type="number"
              value={totalFeedGiven}
              onChange={(e) => setTotalFeedGiven(e.target.value)}
              placeholder="Enter feed amount"
              className="w-full p-2 border rounded-lg bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Feed Unit <Tooltip text="Select unit of feed (kg or g)" />
            </label>
            <select
              value={feedUnit}
              onChange={(e) => setFeedUnit(e.target.value)}
              className="w-full p-2 border rounded-lg bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600"
            >
              <option value="kg">Kilograms</option>
              <option value="g">Grams</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Days Feed Lasted <Tooltip text="Over how many days the feed was consumed" />
            </label>
            <input
              type="number"
              value={daysLasted}
              onChange={(e) => setDaysLasted(e.target.value)}
              placeholder="Enter days"
              className="w-full p-2 border rounded-lg bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Show Result In <Tooltip text="Choose whether to see results in grams or kilograms" />
            </label>
            <select
              value={resultUnit}
              onChange={(e) => setResultUnit(e.target.value)}
              className="w-full p-2 border rounded-lg bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600"
            >
              <option value="kg">Kilograms</option>
              <option value="g">Grams</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={calculateResult}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded shadow"
          >
            Calculate
          </button>
          <button
            onClick={saveRecord}
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded shadow"
          >
            {editingId ? "Update Record" : "Save Record"}
          </button>
          {editingId && (
            <button
              onClick={resetForm}
              className="bg-gray-500 hover:bg-gray-400 text-white px-4 py-2 rounded shadow"
            >
              Cancel Edit
            </button>
          )}
        </div>

        {result && (
          <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded mt-4">
            ✅ Per bird/day: <b>{result.perBird} {result.unit}</b> | Total/day: <b>{result.total} {result.unit}</b>
          </div>
        )}
      </TableCard>

      <TableCard title="📋 Saved Records" className="overflow-x-auto mt-6">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="p-2 text-gray-900 dark:text-white">ID</th>
              <th className="p-2 text-gray-900 dark:text-white">Bird</th>
              <th className="p-2 text-gray-900 dark:text-white">Per Bird/Day</th>
              <th className="p-2 text-gray-900 dark:text-white">Total/Day</th>
              <th className="p-2 text-gray-900 dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.length ? (
              records.map((r) => (
                <tr key={r.id} className="border-b dark:border-gray-700">
                  <td className="p-2">{r.id}</td>
                  <td className="p-2">{r.birdName}</td>
                  <td className="p-2">{r.feedPerBird.toFixed(2)} {resultUnit}</td>
                  <td className="p-2">{r.feedPerDay.toFixed(2)} {resultUnit}</td>
                  <td className="p-2 flex gap-2">
                    <button
                      onClick={() => handleEdit(r)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableCard>
    </motion.div>
  );
}
