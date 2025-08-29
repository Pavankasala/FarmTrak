// src/pages/FeedPredictor.jsx
import { useState, useEffect } from "react";
import { getCurrentUser } from "../utils/login";

export default function FeedPredictor({ flockId }) {
  const userEmail = getCurrentUser(); // logged-in user
  const [numBirds, setNumBirds] = useState("");
  const [birdType, setBirdType] = useState("broiler");
  const [customBird, setCustomBird] = useState("");
  const [totalFeedGiven, setTotalFeedGiven] = useState("");
  const [feedUnit, setFeedUnit] = useState("kg");
  const [daysLasted, setDaysLasted] = useState(1);
  const [resultUnit, setResultUnit] = useState("kg");
  const [result, setResult] = useState(null);
  const [records, setRecords] = useState([]);
  const [editId, setEditId] = useState(null);

  // Load user-specific feed records for this flock
  useEffect(() => {
    const savedRecords = JSON.parse(localStorage.getItem("feedRecords") || "[]");
    setRecords(savedRecords.filter((r) => r.flockId === flockId && r.userEmail === userEmail));
  }, [flockId, userEmail]);

  const calculateFeed = () => {
    const birds = parseFloat(numBirds);
    const totalFeed = parseFloat(totalFeedGiven);
    const days = parseInt(daysLasted);

    if (isNaN(birds) || isNaN(totalFeed) || birds <= 0 || totalFeed <= 0 || days <= 0) {
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

  const resetForm = () => {
    setEditId(null);
    setNumBirds("");
    setBirdType("broiler");
    setCustomBird("");
    setTotalFeedGiven("");
    setFeedUnit("kg");
    setDaysLasted(1);
    setResult(null);
  };

  const saveRecord = () => {
    if (!result) return;

    const birdName = birdType === "other" ? customBird || "Other" : birdType;

    const newRecord = {
      id: editId || Date.now(),
      flockId,
      numBirds,
      birdType,
      customBird: birdType === "other" ? customBird : "",
      totalFeedGiven,
      feedUnit,
      daysLasted,
      perBird: result.perBird,
      total: result.total,
      unit: result.unit,
      birdName,
      date: new Date().toISOString(),
      userEmail,
    };

    let allRecords = JSON.parse(localStorage.getItem("feedRecords") || "[]");
    if (editId) {
      allRecords = allRecords.map((r) => (r.id === editId ? newRecord : r));
    } else {
      allRecords.push(newRecord);
    }

    localStorage.setItem("feedRecords", JSON.stringify(allRecords));
    setRecords(allRecords.filter((r) => r.flockId === flockId && r.userEmail === userEmail));
    resetForm();
  };

  const handleEdit = (record) => {
    setEditId(record.id);
    setNumBirds(record.numBirds);
    setBirdType(record.birdType);
    setCustomBird(record.customBird || "");
    setTotalFeedGiven(record.totalFeedGiven);
    setFeedUnit(record.feedUnit);
    setDaysLasted(record.daysLasted);
    setResult({
      perBird: record.perBird,
      total: record.total,
      unit: record.unit,
    });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this record?")) return;
    const allRecords = JSON.parse(localStorage.getItem("feedRecords") || "[]");
    const updatedRecords = allRecords.filter((r) => r.id !== id);
    localStorage.setItem("feedRecords", JSON.stringify(updatedRecords));
    setRecords(updatedRecords.filter((r) => r.flockId === flockId && r.userEmail === userEmail));
  };

  return (
    <div className="flex flex-col items-center px-4 py-6 space-y-6 w-full max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🧠 Feed Predictor</h1>

      {/* Form + Result + Records */}
      <div className="w-full bg-white dark:bg-white/5 p-6 rounded-2xl shadow space-y-6">
        {/* Form Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Number of Birds</label>
            <input type="number" value={numBirds} onChange={(e) => setNumBirds(e.target.value)} className="w-full border rounded p-2 dark:bg-gray-800 dark:text-white"/>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Bird Type</label>
            <select value={birdType} onChange={(e) => setBirdType(e.target.value)} className="w-full border rounded p-2 dark:bg-gray-800 dark:text-white">
              <option value="broiler">Broiler</option>
              <option value="layer">Layer</option>
              <option value="other">Other</option>
            </select>
          </div>

          {birdType === "other" && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Custom Bird Name</label>
              <input type="text" value={customBird} onChange={(e) => setCustomBird(e.target.value)} className="w-full border rounded p-2 dark:bg-gray-800 dark:text-white" placeholder="Enter bird name"/>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Total Feed Given</label>
            <input type="number" value={totalFeedGiven} onChange={(e) => setTotalFeedGiven(e.target.value)} className="w-full border rounded p-2 dark:bg-gray-800 dark:text-white"/>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Feed Unit</label>
            <select value={feedUnit} onChange={(e) => setFeedUnit(e.target.value)} className="w-full border rounded p-2 dark:bg-gray-800 dark:text-white">
              <option value="kg">Kilograms</option>
              <option value="g">Grams</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Days Feed Lasted</label>
            <input type="number" value={daysLasted} onChange={(e) => setDaysLasted(e.target.value)} className="w-full border rounded p-2 dark:bg-gray-800 dark:text-white"/>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Show Result In</label>
            <select value={resultUnit} onChange={(e) => setResultUnit(e.target.value)} className="w-full border rounded p-2 dark:bg-gray-800 dark:text-white">
              <option value="kg">Kilograms</option>
              <option value="g">Grams</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-2">
          <button onClick={calculateFeed} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded shadow">Calculate</button>
          {editId && <button onClick={resetForm} className="bg-gray-500 hover:bg-gray-400 text-white px-4 py-2 rounded shadow">Cancel</button>}
        </div>

        {/* Result */}
        {typeof result === "string" ? (
          <div className="text-red-600 dark:text-red-400">{result}</div>
        ) : result ? (
          <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded">
            ✅ Per bird/day: <b>{result.perBird} {result.unit}</b> | Total/day: <b>{result.total} {result.unit}</b>
            <div className="mt-2">
              <button onClick={saveRecord} className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded">{editId ? "Update Record" : "Save Record"}</button>
            </div>
          </div>
        ) : null}

        {/* Saved Records Table */}
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">📋 Saved Records</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-white/5 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-left text-gray-600 dark:text-gray-300 text-sm uppercase">
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Bird Type</th>
                <th className="px-4 py-2">Per Bird/Day</th>
                <th className="px-4 py-2">Total Birds/Day</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                [...records].sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((r) => (
                    <tr key={r.id} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-2 whitespace-nowrap">{new Date(r.date).toLocaleDateString()}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{r.birdName}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{r.perBird} {r.unit}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{r.total} {r.unit}</td>
                      <td className="px-4 py-2 flex gap-2 flex-wrap">
                        <button onClick={() => handleEdit(r)} className="bg-yellow-500 hover:bg-yellow-400 text-white px-3 py-1 rounded">Edit</button>
                        <button onClick={() => handleDelete(r.id)} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">No feed records yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
