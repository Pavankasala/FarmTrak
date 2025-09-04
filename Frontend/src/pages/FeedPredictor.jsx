// src/components/FeedPredictor.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/api";

export default function FeedPredictor({ flockId, userEmail }) {
  const [records, setRecords] = useState([]);
  const [newRecord, setNewRecord] = useState({
    numBirds: "",
    birdType: "",
    totalFeedGiven: "",
    unit: "kg",
    daysLasted: "",
  });

  // Fetch feed records
  const fetchRecords = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/feedRecords`, {
        params: { flockId },
        headers: { "X-User-Email": userEmail },
      });
      setRecords(res.data);
    } catch (err) {
      console.error("Error fetching feed records:", err);
    }
  };

  useEffect(() => {
    if (flockId && userEmail) fetchRecords();
  }, [flockId, userEmail]);

  // Add new record
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newRecord,
        flockId,
      };

      const res = await axios.post(`${API_BASE_URL}/feedRecords`, payload, {
        headers: { "X-User-Email": userEmail },
      });
      setRecords([...records, res.data]);
      setNewRecord({
        numBirds: "",
        birdType: "",
        totalFeedGiven: "",
        unit: "kg",
        daysLasted: "",
      });
    } catch (err) {
      console.error("Error adding feed record:", err);
    }
  };

  // Update record
  const handleUpdate = async (id, updatedRecord) => {
    try {
      const res = await axios.put(
        `${API_BASE_URL}/feedRecords/${id}`,
        updatedRecord,
        {
          headers: { "X-User-Email": userEmail },
        }
      );
      setRecords(records.map((r) => (r.id === id ? res.data : r)));
    } catch (err) {
      console.error("Error updating feed record:", err);
    }
  };

  // Delete record
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/feedRecords/${id}`, {
        headers: { "X-User-Email": userEmail },
      });
      setRecords(records.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error deleting feed record:", err);
    }
  };

  return (
    <div className="p-4 bg-light-bg dark:bg-dark-card rounded-lg shadow-md transition-colors">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Feed Predictor
      </h2>

      {/* Add Form */}
      <form onSubmit={handleAdd} className="grid grid-cols-2 gap-2 mb-4">
        <input
          type="number"
          placeholder="Number of Birds"
          value={newRecord.numBirds}
          onChange={(e) => setNewRecord({ ...newRecord, numBirds: e.target.value })}
          className="border rounded p-2"
          required
        />
        <input
          type="text"
          placeholder="Bird Type"
          value={newRecord.birdType}
          onChange={(e) => setNewRecord({ ...newRecord, birdType: e.target.value })}
          className="border rounded p-2"
          required
        />
        <input
          type="number"
          placeholder="Total Feed Given"
          value={newRecord.totalFeedGiven}
          onChange={(e) =>
            setNewRecord({ ...newRecord, totalFeedGiven: e.target.value })
          }
          className="border rounded p-2"
          required
        />
        <select
          value={newRecord.unit}
          onChange={(e) => setNewRecord({ ...newRecord, unit: e.target.value })}
          className="border rounded p-2"
        >
          <option value="kg">kg</option>
          <option value="g">g</option>
        </select>
        <input
          type="number"
          placeholder="Days Lasted"
          value={newRecord.daysLasted}
          onChange={(e) => setNewRecord({ ...newRecord, daysLasted: e.target.value })}
          className="border rounded p-2"
          required
        />
        <button
          type="submit"
          className="col-span-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Add Record
        </button>
      </form>

      {/* Records List */}
      <ul className="space-y-2">
        {records.map((record) => (
          <li
            key={record.id}
            className="flex justify-between items-center bg-light-bg dark:bg-dark-card p-2 rounded shadow-sm transition-colors"
          >
            <span className="text-gray-900 dark:text-white">
              {record.numBirds} {record.birdType} → {record.totalFeedGiven} {record.unit} ({record.daysLasted} days)
            </span>
            <div className="space-x-2">
              <button
                onClick={() =>
                  handleUpdate(record.id, {
                    ...record,
                    totalFeedGiven: parseFloat(record.totalFeedGiven) + 1,
                  })
                }
                className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                +1
              </button>
              <button
                onClick={() => handleDelete(record.id)}
                className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
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
