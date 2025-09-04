// src/components/FeedPredictor.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/api";
import { getCurrentUser } from "../utils/login";

export default function FeedPredictor({ flockId, onDataUpdate }) {
  const [records, setRecords] = useState([]);
  const [flocks, setFlocks] = useState([]);
  const [newRecord, setNewRecord] = useState({
    numBirds: "",
    birdType: "",
    totalFeedGiven: "",
    unit: "kg",
    daysLasted: "",
  });

  const userEmail = getCurrentUser();

  // Load flocks for dropdown
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

  // Load feed records for selected flock
  const fetchRecords = async () => {
    if (!userEmail || !flockId) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/feedRecords`, {
        headers: { "X-User-Email": userEmail },
        params: { flockId: parseInt(flockId, 10) },
      });
      setRecords(res.data || []);

      // Update today's feed total
      const today = new Date().toISOString().split("T")[0];
      const todayRecords = res.data.filter(r => r.date && r.date.startsWith(today));
      const totalToday = todayRecords.reduce((sum, r) => sum + (r.totalFeedGiven || 0), 0);
      onDataUpdate?.({ feedToday: totalToday });
    } catch (err) {
      console.error("Error fetching feed records:", err);
    }
  };

  useEffect(() => {
    fetchFlocks();
  }, [userEmail]);

  useEffect(() => {
    fetchRecords();
  }, [flockId, userEmail]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewRecord({ ...newRecord, [name]: value });
  };

  const resetForm = () => {
    setNewRecord({ numBirds: "", birdType: "", totalFeedGiven: "", unit: "kg", daysLasted: "" });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!flockId) return alert("Please select a flock");
    if (!newRecord.numBirds || !newRecord.birdType || !newRecord.totalFeedGiven || !newRecord.daysLasted) return;

    const numBirds = parseInt(newRecord.numBirds, 10);
    const totalFeed = parseFloat(newRecord.totalFeedGiven);
    const days = parseInt(newRecord.daysLasted, 10);

    const payload = {
      flockId: parseInt(flockId, 10),
      numBirds,
      birdType: newRecord.birdType.trim(),
      totalFeedGiven: totalFeed,
      unit: newRecord.unit,
      daysLasted: days,
      feedPerDay: totalFeed / days,
      feedPerBird: totalFeed / numBirds,
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

  const handleUpdate = async (id, updatedRecord) => {
    const numBirds = parseInt(updatedRecord.numBirds, 10);
    const totalFeed = parseFloat(updatedRecord.totalFeedGiven);
    const days = parseInt(updatedRecord.daysLasted, 10);

    const payload = {
      ...updatedRecord,
      flockId: parseInt(updatedRecord.flockId, 10),
      numBirds,
      totalFeedGiven: totalFeed,
      daysLasted: days,
      feedPerDay: totalFeed / days,
      feedPerBird: totalFeed / numBirds,
    };

    try {
      const res = await axios.put(`${API_BASE_URL}/feedRecords/${id}`, payload, {
        headers: { "X-User-Email": userEmail },
      });
      setRecords(records.map(r => (r.id === id ? res.data : r)));
    } catch (err) {
      console.error("Error updating feed record:", err);
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
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Feed Predictor
      </h2>

      {/* Add Record Form */}
      <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
        <select
          value={flockId || ""}
          onChange={(e) => onDataUpdate?.setFlockId(e.target.value)}
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
          className="col-span-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Add Record
        </button>
      </form>

      {/* Records List */}
      <ul className="space-y-2">
        {records.map(record => (
          <li
            key={record.id}
            className="flex justify-between items-center bg-light-bg dark:bg-dark-card p-2 rounded shadow-sm transition-colors"
          >
            <span className="text-gray-900 dark:text-white">
              {record.numBirds} {record.birdType} → {record.totalFeedGiven} {record.unit} ({record.daysLasted} days)
            </span>
            <div className="space-x-2">
              <button
                onClick={() => handleUpdate(record.id, { ...record, totalFeedGiven: parseFloat(record.totalFeedGiven) + 1 })}
                className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                +1
              </button>
              <button
                onClick={() => handleDelete(record.id)}
                className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
