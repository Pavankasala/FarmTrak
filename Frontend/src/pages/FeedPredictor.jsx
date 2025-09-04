// src/pages/FeedPredictor.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/api";
import { getCurrentUser } from "../utils/login";

export default function FeedPredictor({ initialFlockId }) {
  const userEmail = getCurrentUser();
  const [flocks, setFlocks] = useState([]);
  const [records, setRecords] = useState([]);

  const [flockId, setFlockId] = useState(initialFlockId || "");
  const [numBirds, setNumBirds] = useState("");
  const [birdType, setBirdType] = useState("");
  const [customBird, setCustomBird] = useState("");
  const [totalFeedGiven, setTotalFeedGiven] = useState("");
  const [feedUnit, setFeedUnit] = useState("kg");
  const [daysLasted, setDaysLasted] = useState(1);
  const [resultUnit, setResultUnit] = useState("kg");
  const [result, setResult] = useState(null);
  const [editId, setEditId] = useState(null);

  // Fetch flocks
  useEffect(() => {
    if (!userEmail) return;
    axios.get(`${API_BASE_URL}/flocks`, { headers: { "X-User-Email": userEmail } })
      .then(res => setFlocks(res.data))
      .catch(err => console.error("Error fetching flocks:", err));
  }, [userEmail]);

  // Fetch feed records for selected flock
  useEffect(() => {
    if (!userEmail || !flockId) return;
    axios.get(`${API_BASE_URL}/feedRecords`, {
      headers: { "X-User-Email": userEmail },
      params: { flockId: parseInt(flockId, 10) },
    })
    .then(res => setRecords(res.data))
    .catch(err => console.error("Error fetching feed records:", err));
  }, [flockId, userEmail]);

  // Auto-fill bird type if flock has a default
  useEffect(() => {
    const flock = flocks.find(f => f.id === parseInt(flockId));
    if (flock && flock.birdType) setBirdType(flock.birdType);
  }, [flockId, flocks]);

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

    setResult({
      perBird: resultUnit === "g" ? (perBirdPerDayKg * 1000).toFixed(2) : perBirdPerDayKg.toFixed(2),
      total: resultUnit === "g" ? (totalPerDayKg * 1000).toFixed(2) : totalPerDayKg.toFixed(2),
      unit: resultUnit,
    });
  };

  const resetForm = () => {
    setEditId(null);
    setNumBirds("");
    setBirdType("");
    setCustomBird("");
    setTotalFeedGiven("");
    setFeedUnit("kg");
    setDaysLasted(1);
    setResult(null);
  };

  const saveRecord = async () => {
    if (!result || !flockId) return;

    const birdName = birdType === "other" ? customBird || "Other" : birdType;

    const payload = {
      flockId: parseInt(flockId, 10),
      numBirds: parseInt(numBirds, 10),
      birdType,
      totalFeedGiven: parseFloat(totalFeedGiven),
      unit: feedUnit,
      daysLasted: parseInt(daysLasted, 10),
      feedPerDay: parseFloat(result.total),
      feedPerBird: parseFloat(result.perBird),
      userEmail,
    };

    try {
      if (editId) {
        await axios.put(`${API_BASE_URL}/feedRecords/${editId}`, payload, { headers: { "X-User-Email": userEmail } });
      } else {
        await axios.post(`${API_BASE_URL}/feedRecords`, payload, { headers: { "X-User-Email": userEmail } });
      }
      // Refresh records
      const res = await axios.get(`${API_BASE_URL}/feedRecords`, {
        headers: { "X-User-Email": userEmail },
        params: { flockId: parseInt(flockId, 10) },
      });
      setRecords(res.data);
      resetForm();
    } catch (err) {
      console.error("Error saving feed record:", err);
    }
  };

  const handleEdit = (record) => {
    setEditId(record.id);
    setNumBirds(record.numBirds);
    setBirdType(record.birdType);
    setCustomBird(record.birdType === "other" ? record.customBird : "");
    setTotalFeedGiven(record.totalFeedGiven);
    setFeedUnit(record.unit);
    setDaysLasted(record.daysLasted);
    setResult({ perBird: record.feedPerBird, total: record.feedPerDay, unit: record.unit });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/feedRecords/${id}`, { headers: { "X-User-Email": userEmail } });
      setRecords(records.filter(r => r.id !== id));
    } catch (err) {
      console.error("Error deleting feed record:", err);
    }
  };

  return (
    <div className="flex flex-col items-center px-4 py-6 space-y-6 w-full max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🧠 Feed Predictor</h1>

      <div className="w-full bg-white dark:bg-white/5 p-6 rounded-2xl shadow space-y-6">
        {/* Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label>Flock</label>
            <select value={flockId} onChange={e => setFlockId(e.target.value)} className="w-full border p-2 rounded dark:bg-gray-800 dark:text-white">
              <option value="">Select Flock</option>
              {flocks.map(f => <option key={f.id} value={f.id}>{f.type} ({f.quantity} birds)</option>)}
            </select>
          </div>

          <div>
            <label>Number of Birds</label>
            <input type="number" value={numBirds} onChange={e => setNumBirds(e.target.value)} className="w-full border p-2 rounded dark:bg-gray-800 dark:text-white"/>
          </div>

          <div>
            <label>Bird Type</label>
            <select value={birdType} onChange={e => setBirdType(e.target.value)} className="w-full border p-2 rounded dark:bg-gray-800 dark:text-white">
              <option value="">Select Type</option>
              <option value="broiler">Broiler</option>
              <option value="layer">Layer</option>
              <option value="other">Other</option>
            </select>
          </div>

          {birdType === "other" && (
            <div>
              <label>Custom Bird Name</label>
              <input type="text" value={customBird} onChange={e => setCustomBird(e.target.value)} className="w-full border p-2 rounded dark:bg-gray-800 dark:text-white" placeholder="Enter bird name"/>
            </div>
          )}

          <div>
            <label>Total Feed Given</label>
            <input type="number" value={totalFeedGiven} onChange={e => setTotalFeedGiven(e.target.value)} className="w-full border p-2 rounded dark:bg-gray-800 dark:text-white"/>
          </div>

          <div>
            <label>Feed Unit</label>
            <select value={feedUnit} onChange={e => setFeedUnit(e.target.value)} className="w-full border p-2 rounded dark:bg-gray-800 dark:text-white">
              <option value="kg">Kilograms</option>
              <option value="g">Grams</option>
            </select>
          </div>

          <div>
            <label>Days Feed Lasted</label>
            <input type="number" value={daysLasted} onChange={e => setDaysLasted(e.target.value)} className="w-full border p-2 rounded dark:bg-gray-800 dark:text-white"/>
          </div>

          <div>
            <label>Show Result In</label>
            <select value={resultUnit} onChange={e => setResultUnit(e.target.value)} className="w-full border p-2 rounded dark:bg-gray-800 dark:text-white">
              <option value="kg">Kilograms</option>
              <option value="g">Grams</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button onClick={calculateFeed} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded">Calculate</button>
          {editId && <button onClick={resetForm} className="bg-gray-500 hover:bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>}
          {result && <button onClick={saveRecord} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded">{editId ? "Update Record" : "Save Record"}</button>}
        </div>

        {/* Result */}
        {typeof result === "string" ? <div className="text-red-600 dark:text-red-400">{result}</div> : null}
        {result && typeof result !== "string" && (
          <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded">
            ✅ Per bird/day: <b>{result.perBird} {result.unit}</b> | Total/day: <b>{result.total} {result.unit}</b>
          </div>
        )}

        {/* Saved Records Table */}
        <h2 className="text-xl font-semibold mt-6">📋 Saved Records</h2>
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
              {records.length > 0 ? records.sort((a,b)=>new Date(b.date)-new Date(a.date)).map(r => (
                <tr key={r.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{r.birdType === "other" ? r.customBird : r.birdType}</td>
                  <td className="px-4 py-2">{r.feedPerBird.toFixed(2)} {r.unit}</td>
                  <td className="px-4 py-2">{r.feedPerDay.toFixed(2)} {r.unit}</td>
                  <td className="px-4 py-2 flex gap-2 flex-wrap">
                    <button onClick={() => handleEdit(r)} className="bg-yellow-500 hover:bg-yellow-400 text-white px-3 py-1 rounded">Edit</button>
                    <button onClick={() => handleDelete(r.id)} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">No feed records yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
