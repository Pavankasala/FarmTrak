// src/components/FeedPredictor.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/api";

export default function FeedPredictor({ flockId, userEmail }) {
  const [records, setRecords] = useState([]);
  const [newRecord, setNewRecord] = useState({
    date: "",
    feedAmount: "",
  });

  // Fetch feed records
  const fetchRecords = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/feedRecords`, {
        params: { flockId, userEmail },
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
      const res = await axios.post(`${API_BASE_URL}/api/feedRecords`, newRecord, {
        headers: { "X-User-Email": userEmail },
      });
      setRecords([...records, res.data]);
      setNewRecord({ date: "", feedAmount: "" });
    } catch (err) {
      console.error("Error adding feed record:", err);
    }
  };

  // Update record
  const handleUpdate = async (id, updatedRecord) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/api/feedRecords/${id}`, updatedRecord, {
        headers: { "X-User-Email": userEmail },
      });
      setRecords(records.map((r) => (r.id === id ? res.data : r)));
    } catch (err) {
      console.error("Error updating feed record:", err);
    }
  };

  // Delete record
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/feedRecords/${id}`, {
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
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          type="date"
          value={newRecord.date}
          onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
          className="border rounded p-2 flex-1 bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-white"
          required
        />
        <input
          type="number"
          placeholder="Feed Amount"
          value={newRecord.feedAmount}
          onChange={(e) => setNewRecord({ ...newRecord, feedAmount: e.target.value })}
          className="border rounded p-2 flex-1 bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-white"
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Add
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
              {record.date} - {record.feedAmount} kg
            </span>
            <div className="space-x-2">
              <button
                onClick={() =>
                  handleUpdate(record.id, {
                    ...record,
                    feedAmount: parseFloat(record.feedAmount) + 1,
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
//localhost