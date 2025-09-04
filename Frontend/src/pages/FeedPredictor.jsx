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

  // ✅ Sync with backend + localStorage
  const fetchRecords = async () => {
    try {
      const res = await api.get("/feedRecords", {
        params: { userEmail },
        headers: { "X-User-Email": userEmail },
      });
      setFeedRecords(res.data);
      localStorage.setItem("feedRecords", JSON.stringify(res.data));
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
    const payload = {
      flockId,
      feedAmount: parseFloat(feedAmount),
      userEmail,
      date: new Date().toISOString(),
    };

    try {
      if (editingId) {
        await api.put(`/feedRecords/${editingId}`, payload, {
          headers: { "X-User-Email": userEmail },
        });
      } else {
        await api.post("/feedRecords", payload, {
          headers: { "X-User-Email": userEmail },
        });
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
    if (!window.confirm("Delete this feed record?")) return;
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
    setFeedAmount(record.feedAmount.toString());
  };

  return (
    <div className="flex flex-col items-center px-4 py-6 space-y-6 w-full max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">🧠 Feed Predictor</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full bg-light-bg dark:bg-dark-card shadow p-6 rounded-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Flock ID"
            value={flockId}
            onChange={(e) => setFlockId(e.target.value)}
            className="w-full border p-2 rounded border-light-muted dark:border-dark-dim bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text"
            required
          />
          <input
            type="number"
            placeholder="Feed Amount (kg)"
            value={feedAmount}
            onChange={(e) => setFeedAmount(e.target.value)}
            className="w-full border p-2 rounded border-light-muted dark:border-dark-dim bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text"
            required
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            {editingId ? "✏️ Update Feed" : "➕ Add Feed"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="bg-dark-dim text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Records Table */}
      <div className="w-full overflow-x-auto">
        <table className="min-w-full text-left bg-light-bg dark:bg-dark-card shadow rounded-xl">
          <thead>
            <tr className="border-b border-light-muted dark:border-dark-dim">
              <th className="p-2 text-light-text dark:text-dark-text">#</th>
              <th className="p-2 text-light-text dark:text-dark-text">Date</th>
              <th className="p-2 text-light-text dark:text-dark-text">Flock ID</th>
              <th className="p-2 text-light-text dark:text-dark-text">Feed Amount (kg)</th>
              <th className="p-2 text-light-text dark:text-dark-text">Actions</th>
            </tr>
          </thead>
          <tbody>
            {feedRecords.length > 0 ? (
              [...feedRecords]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((record, index) => (
                  <tr key={record.id} className="border-b border-light-muted dark:border-dark-dim">
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="p-2">{record.flockId}</td>
                    <td className="p-2">{record.feedAmount} kg</td>
                    <td className="p-2 space-x-2">
                      <button
                        onClick={() => handleEdit(record)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-center text-light-subtext dark:text-dark-subtext">
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
