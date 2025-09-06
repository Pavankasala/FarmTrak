// src/pages/FeedPredictor.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { InformationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { API_BASE_URL } from "../utils/api";
import { getCurrentUser } from "../utils/login";

export default function FeedPredictor() {
  const userEmail = getCurrentUser(); // Logged-in user

  const [flocks, setFlocks] = useState([]);
  const [selectedFlockId, setSelectedFlockId] = useState(null);

  const [birdType, setBirdType] = useState("broiler");
  const [customBird, setCustomBird] = useState("");
  const [numBirds, setNumBirds] = useState("");
  const [totalFeedGiven, setTotalFeedGiven] = useState("");
  const [feedUnit, setFeedUnit] = useState("kg");
  const [daysLasted, setDaysLasted] = useState(1);
  const [resultUnit, setResultUnit] = useState("kg");
  const [result, setResult] = useState(null);
  const [records, setRecords] = useState([]);
  const [editId, setEditId] = useState(null);

  // ---------------- Tutorial Banner ----------------
  const [showTutorial, setShowTutorial] = useState(() => {
    return localStorage.getItem("feedTutorialDismissed") !== "true";
  });

  const dismissTutorial = () => {
    localStorage.setItem("feedTutorialDismissed", "true");
    setShowTutorial(false);
  };

  // ---------------- Fetch all flocks ----------------
  const fetchFlocks = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/flocks`, {
        headers: { "X-User-Email": userEmail },
      });
      setFlocks(res.data || []);
      if (res.data.length > 0 && !selectedFlockId) {
        setSelectedFlockId(res.data[0].id); // default first flock
      }
    } catch (err) {
      console.error("Error fetching flocks:", err);
    }
  };

  // ---------------- Fetch all feed records ----------------
  const fetchRecords = async () => {
    if (!selectedFlockId) return;
    try {
      const res = await axios.get(
        `${API_BASE_URL}/feedRecords?flockId=${selectedFlockId}`,
        {
          headers: { "X-User-Email": userEmail },
        }
      );
      setRecords(res.data || []);
    } catch (err) {
      console.error("Error fetching feed records:", err);
    }
  };

  useEffect(() => {
    fetchFlocks();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [selectedFlockId]);

  // ---------------- Calculate feed result ----------------
  const calculateFeed = () => {
    const birds = parseFloat(numBirds);
    const totalFeed = parseFloat(totalFeedGiven);
    const days = parseInt(daysLasted);

    if (!birds || !totalFeed || !days || birds <= 0 || totalFeed <= 0 || days <= 0) {
      setResult("Please enter valid numbers.");
      return;
    }

    const feedKg = feedUnit === "g" ? totalFeed / 1000 : totalFeed;
    const perBirdPerDayKg = feedKg / birds / days;
    const totalPerDayKg = feedKg / days;

    const displayPerBird = resultUnit === "g" ? perBirdPerDayKg * 1000 : perBirdPerDayKg;
    const displayTotal = resultUnit === "g" ? totalPerDayKg * 1000 : totalPerDayKg;

    setResult({
      perBird: displayPerBird.toFixed(2),
      total: displayTotal.toFixed(2),
      unit: resultUnit,
    });
  };

  // ---------------- Reset form ----------------
  const resetForm = () => {
    setEditId(null);
    setBirdType("broiler");
    setCustomBird("");
    setNumBirds("");
    setTotalFeedGiven("");
    setFeedUnit("kg");
    setDaysLasted(1);
    setResult(null);
  };

  // ---------------- Save or update record ----------------
  const saveRecord = async () => {
    if (!result || !selectedFlockId) return;

    const birds = parseInt(numBirds, 10);
    const totalFeed = parseFloat(totalFeedGiven);
    const days = parseInt(daysLasted, 10);

    if (!birds || !totalFeed || !days) {
      alert("Please enter valid numbers.");
      return;
    }

    const birdName = birdType === "other" ? customBird || "Other" : birdType;
    const totalFeedKg = feedUnit === "g" ? totalFeed / 1000 : totalFeed;
    const feedPerDayKg = totalFeedKg / days;
    const feedPerBirdKg = totalFeedKg / birds / days;

    const payload = {
      flockId: selectedFlockId,
      numBirds: birds,
      birdType,
      customBird: birdType === "other" ? customBird : "",
      totalFeedGiven: totalFeedKg,
      unit: "kg",
      daysLasted: days,
      feedPerDay: feedPerDayKg,
      feedPerBird: feedPerBirdKg,
      birdName,
      date: new Date().toISOString().split("T")[0],
      userEmail,
    };

    try {
      if (editId) {
        const res = await axios.put(
          `${API_BASE_URL}/feedRecords/${editId}`,
          payload,
          { headers: { "X-User-Email": userEmail } }
        );
        setRecords(records.map((r) => (r.id === editId ? res.data : r)));
      } else {
        const res = await axios.post(`${API_BASE_URL}/feedRecords`, payload, {
          headers: { "X-User-Email": userEmail },
        });
        setRecords([res.data, ...records]);
      }
      resetForm();
    } catch (err) {
      console.error("Error saving feed record:", err);
    }
  };

  // ---------------- Edit record ----------------
  const handleEdit = (record) => {
    setEditId(record.id);

    if (record.birdType === "other") {
      setBirdType("other");
      setCustomBird(record.customBird || "Other");
    } else {
      setBirdType(record.birdType || "broiler");
      setCustomBird("");
    }

    setNumBirds(record.numBirds);
    setTotalFeedGiven(record.totalFeedGiven);
    setFeedUnit("kg");
    setDaysLasted(record.daysLasted);

    const perBird =
      resultUnit === "g" ? record.feedPerBird * 1000 : record.feedPerBird;
    const total =
      resultUnit === "g"
        ? record.feedPerDay * record.daysLasted * 1000
        : record.feedPerDay * record.daysLasted;

    setResult({
      perBird: perBird.toFixed(2),
      total: total.toFixed(2),
      unit: resultUnit,
      date: record.date,
    });
  };

  // ---------------- Delete record ----------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/feedRecords/${id}`, {
        headers: { "X-User-Email": userEmail },
      });
      setRecords(records.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error deleting record:", err);
    }
  };

  // ---------------- Tooltip Component ----------------
  const Tooltip = ({ text }) => (
    <span className="relative group cursor-pointer inline-flex items-center">
      <InformationCircleIcon className="h-4 w-4 ml-1 text-gray-500 dark:text-gray-400" />
      <motion.span
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="absolute left-1/2 -translate-x-1/2 -top-8 w-max max-w-xs px-2 py-1 rounded-md 
                 bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 text-xs shadow-md 
                 opacity-0 group-hover:opacity-100 pointer-events-none"
      >
        {text}
      </motion.span>
    </span>
  );

  return (
    <div className="flex flex-col items-center px-4 py-6 space-y-6 w-full max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        🧠 Feed Predictor
      </h1>

      {/* Tutorial Banner */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="w-full bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200 px-4 py-3 rounded relative flex items-start"
          >
            <div>
              <strong className="font-bold">💡 Quick Guide:</strong>
              <p className="text-sm mt-1">
                Enter your flock details → Click <b>Calculate</b> → Save the
                record to track feeding patterns.
              </p>
            </div>
            <button
              onClick={dismissTutorial}
              className="ml-auto text-blue-700 dark:text-blue-300 hover:text-blue-900"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <div className="w-full bg-white dark:bg-white/5 p-6 rounded-2xl shadow space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Bird Type */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Bird Type <Tooltip text="Select type of bird (Broiler, Layer, or Other)" />
            </label>
            <select
              value={birdType}
              onChange={(e) => setBirdType(e.target.value)}
              className="w-full border rounded p-2 dark:bg-gray-800 dark:text-white"
            >
              <option value="broiler">Broiler</option>
              <option value="layer">Layer</option>
              <option value="other">Other</option>
            </select>
          </div>

          {birdType === "other" && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Custom Bird Name{" "}
                <Tooltip text="Enter the bird name if it's not Broiler or Layer" />
              </label>
              <input
                type="text"
                value={customBird}
                onChange={(e) => setCustomBird(e.target.value)}
                className="w-full border rounded p-2 dark:bg-gray-800 dark:text-white"
                placeholder="Enter bird name"
              />
            </div>
          )}

          {/* Number of Birds */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Number of Birds{" "}
              <Tooltip text="How many birds are in this flock?" />
            </label>
            <input
              type="number"
              value={numBirds}
              onChange={(e) => setNumBirds(e.target.value)}
              className="w-full border rounded p-2 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Total Feed Given */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Total Feed Given{" "}
              <Tooltip text="Amount of feed provided in total (kg or g)" />
            </label>
            <input
              type="number"
              value={totalFeedGiven}
              onChange={(e) => setTotalFeedGiven(e.target.value)}
              className="w-full border rounded p-2 dark:bg-gray-800 dark:text-white"
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
              className="w-full border rounded p-2 dark:bg-gray-800 dark:text-white"
            >
              <option value="kg">Kilograms</option>
              <option value="g">Grams</option>
            </select>
          </div>

          {/* Days Lasted */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Days Feed Lasted{" "}
              <Tooltip text="Over how many days the feed was consumed" />
            </label>
            <input
              type="number"
              value={daysLasted}
              onChange={(e) => setDaysLasted(e.target.value)}
              className="w-full border rounded p-2 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Result Unit */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Show Result In{" "}
              <Tooltip text="Choose whether to see results in grams or kilograms" />
            </label>
            <select
              value={resultUnit}
              onChange={(e) => setResultUnit(e.target.value)}
              className="w-full border rounded p-2 dark:bg-gray-800 dark:text-white"
            >
              <option value="kg">Kilograms</option>
              <option value="g">Grams</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={calculateFeed}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded shadow"
          >
            Calculate
          </button>
          {editId && (
            <button
              onClick={resetForm}
              className="bg-gray-500 hover:bg-gray-400 text-white px-4 py-2 rounded shadow"
            >
              Cancel
            </button>
          )}
          {result && (
            <button
              onClick={saveRecord}
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded shadow"
            >
              {editId ? "Update Record" : "Save Record"}
            </button>
          )}
        </div>

        {/* Result Display */}
        <AnimatePresence>
          {typeof result === "string" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-red-600 dark:text-red-400"
            >
              {result}
            </motion.div>
          )}
          {result && typeof result !== "string" && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 bg-green-100 dark:bg-green-900/20 rounded"
            >
              ✅ Per bird/day: <b>{result.perBird} {result.unit}</b> | Total/day:{" "}
              <b>{result.total} {result.unit}</b>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Saved Records Table */}
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">
          📋 Saved Records
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-white/5 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-left text-gray-600 dark:text-gray-300 text-sm uppercase">
                <th className="px-4 py-2">Flock ID</th>
                <th className="px-4 py-2">Bird Type</th>
                <th className="px-4 py-2">Per Bird/Day</th>
                <th className="px-4 py-2">Total Birds/Day</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {records.length > 0 ? (
                  [...records]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((r) => (
                      <motion.tr
                        key={r.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="border-t border-gray-200 dark:border-gray-700"
                      >
                        <td className="px-4 py-2">{r.flockId || r.id}</td>
                        <td className="px-4 py-2">
                          {r.birdType === "other" ? r.customBird : r.birdType}
                        </td>
                        <td className="px-4 py-2">
                          {resultUnit === "g"
                            ? (
                              (r.totalFeedGiven / r.numBirds / r.daysLasted) *
                              1000
                            ).toFixed(2)
                            : (
                              r.totalFeedGiven /
                              r.numBirds /
                              r.daysLasted
                            ).toFixed(2)}{" "}
                          {resultUnit}
                        </td>
                        <td className="px-4 py-2">
                          {resultUnit === "g"
                            ? ((r.totalFeedGiven / r.daysLasted) * 1000).toFixed(
                              2
                            )
                            : (r.totalFeedGiven / r.daysLasted).toFixed(2)}{" "}
                          {resultUnit}
                        </td>
                        <td className="px-4 py-2 flex gap-2 flex-wrap">
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
                      </motion.tr>
                    ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-4 text-center text-gray-500 dark:text-gray-400"
                    >
                      No records found
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
