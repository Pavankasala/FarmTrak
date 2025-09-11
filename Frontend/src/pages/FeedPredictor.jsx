// src/pages/FeedPredictor.jsx
import { useState, useEffect } from "react";
import { apiClient } from "../utils/apiClient";
import { getCurrentUser } from "../utils/login";

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
  const [birdType, setBirdType] = useState("broiler");
  const [customBird, setCustomBird] = useState("");
  const [numBirds, setNumBirds] = useState("");
  const [totalFeedGiven, setTotalFeedGiven] = useState("");
  const [feedUnit, setFeedUnit] = useState("kg");
  const [daysLasted, setDaysLasted] = useState("10");
  const [resultUnit, setResultUnit] = useState("g");
  const [result, setResult] = useState(null);
  const [records, setRecords] = useState([]);

  // fetch saved records from backend
  const fetchRecords = async () => {
    try {
      const res = await apiClient.get(`/api/feed-records`, {
        headers: { "X-User-Email": userEmail },
      });
      setRecords(res.data);
    } catch (err) {
      console.error("Error fetching records:", err);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  // --- Calculate ---
  const calculateResult = () => {
    if (!numBirds || !totalFeedGiven || !daysLasted) return;

    let total = parseFloat(totalFeedGiven);
    if (feedUnit === "kg") total = total * 1000; // convert kg → g

    const totalPerDay = total / daysLasted;
    const perBird = totalPerDay / numBirds;

    let unit = "g";
    let displayPerBird = perBird;
    let displayTotal = totalPerDay;

    if (resultUnit === "kg") {
      displayPerBird = perBird / 1000;
      displayTotal = totalPerDay / 1000;
      unit = "kg";
    }

    setResult({
      perBird: displayPerBird.toFixed(2),
      total: displayTotal.toFixed(2),
      unit,
    });
  };

  // --- Save record to backend ---
  const saveRecord = async () => {
    if (!result) {
      calculateResult();
      if (!result) return;
    }

    const record = {
      birdName: birdType === "other" ? customBird : birdType,
      numBirds: parseInt(numBirds),
      totalFeedGiven: parseFloat(totalFeedGiven),
      daysLasted: parseInt(daysLasted),
    };

    try {
      await apiClient.post(`/api/feed-records`, record, {
        headers: { "X-User-Email": userEmail },
      });
      fetchRecords();
    } catch (err) {
      console.error("Error saving record:", err);
    }
  };

  const deleteRecord = async (id) => {
    try {
      await apiClient.delete(`/api/feed-records/${id}`, {
        headers: { "X-User-Email": userEmail },
      });
      fetchRecords();
    } catch (err) {
      console.error("Error deleting record:", err);
    }
  };

  return (
    <div className="flex flex-col items-center px-4 py-6 space-y-6 w-full max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        🧠 Feed Predictor
      </h1>

      <div className="w-full bg-white dark:bg-gray-900 p-6 rounded-2xl shadow space-y-6">
        {/* Input grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Bird Type */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Bird Type <Tooltip text="Select type of bird (Broiler, Layer, or Other)" />
            </label>
            <select
              value={birdType}
              onChange={(e) => setBirdType(e.target.value)}
              className="w-full p-2 border rounded-lg bg-white text-gray-900 
                dark:bg-gray-800 dark:text-white dark:border-gray-600"
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
                className="w-full p-2 border rounded-lg bg-white text-gray-900 
                  dark:bg-gray-800 dark:text-white dark:border-gray-600"
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
              className="w-full p-2 border rounded-lg bg-white text-gray-900 
                dark:bg-gray-800 dark:text-white dark:border-gray-600"
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
              className="w-full p-2 border rounded-lg bg-white text-gray-900 
                dark:bg-gray-800 dark:text-white dark:border-gray-600"
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
              className="w-full p-2 border rounded-lg bg-white text-gray-900 
                dark:bg-gray-800 dark:text-white dark:border-gray-600"
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
              className="w-full p-2 border rounded-lg bg-white text-gray-900 
                dark:bg-gray-800 dark:text-white dark:border-gray-600"
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
              className="w-full p-2 border rounded-lg bg-white text-gray-900 
                dark:bg-gray-800 dark:text-white dark:border-gray-600"
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
            Save Record
          </button>
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
                records.map((r) => {
                  let total = r.totalFeedGiven;
                  if (feedUnit === "kg") total = total * 1000;
                  const perDay = total / r.daysLasted;
                  const perBird = perDay / r.numBirds;

                  let displayPerBird = resultUnit === "kg" ? perBird / 1000 : perBird;
                  let displayTotal = resultUnit === "kg" ? perDay / 1000 : perDay;

                  return (
                    <tr key={r.id} className="border-t border-gray-200 dark:border-gray-600">
                      <td className="px-4 py-2">{r.id}</td>
                      <td className="px-4 py-2">{r.birdName}</td>
                      <td className="px-4 py-2">{displayPerBird.toFixed(2)} {resultUnit}</td>
                      <td className="px-4 py-2">{displayTotal.toFixed(2)} {resultUnit}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded">
                          Edit
                        </button>
                        <button
                          onClick={() => deleteRecord(r.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
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
