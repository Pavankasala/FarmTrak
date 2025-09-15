// src/pages/FeedPredictor.jsx
import { useState, useEffect } from "react";
import { apiClient } from "../utils/apiClient";
import { getCurrentUser } from "../utils/login";
import Tooltip from "../components/Tooltip";

export default function FeedPredictor() {
  const [birdType, setBirdType] = useState("broiler");
  const [customBird, setCustomBird] = useState("");
  const [numBirds, setNumBirds] = useState("");
  const [totalFeedGiven, setTotalFeedGiven] = useState("");
  const [feedUnit, setFeedUnit] = useState("kg");
  const [daysLasted, setDaysLasted] = useState("10");
  const [resultUnit, setResultUnit] = useState("g");
  const [result, setResult] = useState(null);
  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null); // track editing record id

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
    setResultUnit("g");
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
        // update existing
        await apiClient.updateFeedRecord(editingId, payload);
      } else {
        // create new
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
    setDaysLasted(record.daysLasted);
    setFeedUnit("kg"); // assume entered in kg, adjust if needed
    setResultUnit("g");
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <div className="flex flex-col items-center px-4 py-6 space-y-6 w-full max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        🧠 Feed Predictor
      </h1>

      <div className="w-full bg-white dark:bg-gray-900 p-6 rounded-2xl shadow space-y-6">
        {/* Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Bird Type */}
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

          {/* Number of Birds */}
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

          {/* Total Feed Given */}
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

          {/* Feed Unit */}
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

          {/* Days Lasted */}
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

          {/* Result Unit */}
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

        {/* Buttons */}
        <div className="flex flex-wrap gap-2">
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

        {/* Result Box */}
        {result && (
          <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded">
            ✅ Per bird/day: <b>{result.perBird} {result.unit}</b> | Total/day: <b>{result.total} {result.unit}</b>
          </div>
        )}

        {/* Records Table */}
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">
          📋 Saved Records
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 text-left text-gray-600 dark:text-gray-300 text-sm uppercase">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Bird</th>
                <th className="px-4 py-2">Per Bird/Day</th>
                <th className="px-4 py-2">Total/Day</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                records.map((r) => (
                  <tr key={r.id} className="border-t border-gray-200 dark:border-gray-600">
                    <td className="px-4 py-2">{r.id}</td>
                    <td className="px-4 py-2">{r.birdName}</td>
                    <td className="px-4 py-2">{r.feedPerBird.toFixed(2)} {resultUnit}</td>
                    <td className="px-4 py-2">{r.feedPerDay.toFixed(2)} {resultUnit}</td>
                    <td className="px-4 py-2 flex gap-2">
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
                  <td colSpan="5" className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
