// src/components/FeedPredictor.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/api";
import { getCurrentUser } from "../utils/login";

export default function FeedPredictor({ flockId: initialFlockId, onDataUpdate }) {
  const [records, setRecords] = useState([]);
  const [flocks, setFlocks] = useState([]);
  const [newRecord, setNewRecord] = useState({
    flockId: initialFlockId || "",
    numBirds: "",
    birdType: "",
    totalFeedGiven: "",
    unit: "kg",
    daysLasted: "",
  });

  const userEmail = getCurrentUser();

  // Fetch available flocks for dropdown
  const fetchFlocks = async () => {
    if (!userEmail) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/flocks`, {
        headers: { "X-User-Email": userEmail },
      });
      setFlocks(res.data || []);
    } catch (err) {
      console.error("Error fetching flocks:", err);
    }
  };

  // Fetch feed records
  const fetchRecords = async () => {
    if (!userEmail || !newRecord.flockId) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/feedRecords`, {
        headers: { "X-User-Email": userEmail },
        params: { flockId: parseInt(newRecord.flockId, 10) },
      });
      setRecords(res.data || []);
      // Update today's total feed
      const today = new Date().toISOString().split("T")[0];
      const todayRecords = res.data.filter(r => r.date && r.date.startsWith(today));
      const totalToday = todayRecords.reduce((sum, r) => sum + (r.totalFeedGiven || 0), 0);
      onDataUpdate?.({ feedToday: totalToday });
    } catch (err) {
      console.error("Error fetching feed records:", err);
    }
  };

  useEffect(() => { fetchFlocks(); }, [userEmail]);
  useEffect(() => { fetchRecords(); }, [newRecord.flockId, userEmail]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewRecord({ ...newRecord, [name]: value });
  };

  const resetForm = () => {
    setNewRecord({
      flockId: initialFlockId || "",
      numBirds: "",
      birdType: "",
      totalFeedGiven: "",
      unit: "kg",
      daysLasted: "",
    });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newRecord.flockId) return alert("Please select a flock");
    if (!newRecord.numBirds || !newRecord.birdType || !newRecord.totalFeedGiven || !newRecord.daysLasted) return;

    const numBirds = parseInt(newRecord.numBirds, 10);
    const totalFeed = parseFloat(newRecord.totalFeedGiven);
    const days = parseInt(newRecord.daysLasted, 10);

    const payload = {
      flockId: parseInt(newRecord.flockId, 10),
      numBirds,
      birdType: newRecord.birdType.trim(),
      totalFeedGiven: totalFeed,
      unit: newRecord.unit,
      daysLasted: days,
      feedPerDay: totalFeed / days,
      feedPerBird: totalFeed / numBirds,
      date: new Date().toISOString(),
      userEmail,
    };

    try {
      const res = await axios.post(`${API_BASE_URL}/feedRecords`, payload, {
        headers: { "X-User-Email": userEmail },
      });
      setRecords([...records, res.data]);
      resetForm();
    } catch (err) {
      console.error("Error adding feed record:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/feedRecords/${id}`, {
        headers: { "X-User-Email": userEmail },
      });
      setRecords(records.filter(r => r.id !== id));
    } catch (err) {
      console.error("Error deleting feed record:", err);
    }
  };

  return (
    <div className="p-4 bg-light-bg dark:bg-dark-card rounded-lg shadow-md transition-colors">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Feed Predictor</h2>

      {/* Add Record Form */}
      <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
        <select
          name="flockId"
          value={newRecord.flockId || ""}
          onChange={handleChange}
          required
          className="border p-2 rounded dark:bg-gray-800 dark:text-white"
        >
          <option value="">Select Flock</option>
          {flocks.map(f => (
            <option key={f.id} value={f.id}>
              {f.type} ({f.quantity} birds)
            </option>
          ))}
        </select>
        <input
          type="number"
          name="numBirds"
          placeholder="Number of Birds"
          value={newRecord.numBirds}
          onChange={handleChange}
          className="border p-2 rounded dark:bg-gray-800 dark:text-white"
          required
        />
        <input
          type="text"
          name="birdType"
          placeholder="Bird Type"
          value={newRecord.birdType}
          onChange={handleChange}
          className="border p-2 rounded dark:bg-gray-800 dark:text-white"
          required
        />
        <input
          type="number"
          name="totalFeedGiven"
          placeholder="Total Feed Given"
          value={newRecord.totalFeedGiven}
          onChange={handleChange}
          className="border p-2 rounded dark:bg-gray-800 dark:text-white"
          required
        />
        <select
          name="unit"
          value={newRecord.unit}
          onChange={handleChange}
          className="border p-2 rounded dark:bg-gray-800 dark:text-white"
        >
          <option value="kg">kg</option>
          <option value="g">g</option>
        </select>
        <input
          type="number"
          name="daysLasted"
          placeholder="Days Lasted"
          value={newRecord.daysLasted}
          onChange={handleChange}
          className="border p-2 rounded dark:bg-gray-800 dark:text-white"
          required
        />
        <button
          type="submit"
          className="col-span-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Add Record
        </button>
      </form>

      {/* Records Table */}
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
              [...records]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((r) => (
                  <tr key={r.id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-2 whitespace-nowrap">
                      {new Date(r.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">{r.birdType}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {(r.totalFeedGiven / r.numBirds / r.daysLasted).toFixed(2)} {r.unit}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {(r.totalFeedGiven / r.daysLasted).toFixed(2)} {r.unit}
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="5" className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                  No feed records yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
