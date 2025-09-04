// src/pages/FeedPredictor.jsx
import React, { useEffect, useState } from "react";
import { api } from "../utils/api";
import { getCurrentUser } from "../utils/login";

export default function FeedPredictor() {
  const [feedRecords, setFeedRecords] = useState([]);
  const [flockId, setFlockId] = useState("");
  const [feedAmount, setFeedAmount] = useState("");
  const [editingId, setEditingId] = useState(null);

  const userEmail = getCurrentUser();

  // ✅ Fetch records
  const fetchRecords = async () => {
    try {
      const res = await api.get("/feedRecords", {
        params: { userEmail },
        headers: { "X-User-Email": userEmail },
      });
      setFeedRecords(res.data);
    } catch (err) {
      console.error("Error fetching feed records:", err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // ✅ Add / update feed record
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(
          `/feedRecords/${editingId}`,
          { flockId, feedAmount },
          { headers: { "X-User-Email": userEmail } }
        );
      } else {
        await api.post(
          "/feedRecords",
          { flockId, feedAmount },
          { headers: { "X-User-Email": userEmail } }
        );
      }
      setFlockId("");
      setFeedAmount("");
      setEditingId(null);
      fetchRecords();
    } catch (err) {
      console.error("Error saving record:", err);
    }
  };

  // ✅ Delete record
  const handleDelete = async (id) => {
    try {
      await api.delete(`/feedRecords/${id}`, {
        headers: { "X-User-Email": userEmail },
      });
      fetchRecords();
    } catch (err) {
      console.error("Error deleting record:", err);
    }
  };

  // ✅ Edit record
  const handleEdit = (record) => {
    setEditingId(record.id);
    setFlockId(record.flockId);
    setFeedAmount(record.feedAmount);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Feed Predictor</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Flock ID"
          value={flockId}
          onChange={(e) => setFlockId(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="number"
          placeholder="Feed Amount"
          value={feedAmount}
          onChange={(e) => setFeedAmount(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          {editingId ? "Update" : "Add"} Record
        </button>
      </form>

      <ul className="mt-6 space-y-2">
        {feedRecords.map((record) => (
          <li
            key={record.id}
            className="flex justify-between items-center border p-3 rounded"
          >
            <span>
              Flock {record.flockId} - {record.feedAmount} kg
            </span>
            <div className="space-x-2">
              <button
                onClick={() => handleEdit(record)}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(record.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
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
