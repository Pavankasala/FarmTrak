// src/pages/FlockManagement.jsx
import React, { useEffect, useState } from "react";
import { api } from "../utils/api";
import { getCurrentUser } from "../utils/login";

export default function FlockManagement() {
  const [flocks, setFlocks] = useState([]);
  const [flockName, setFlockName] = useState("");
  const [flockSize, setFlockSize] = useState("");
  const [editingId, setEditingId] = useState(null);

  const userEmail = getCurrentUser();

  // ✅ Fetch flocks
  const fetchFlocks = async () => {
    try {
      const res = await api.get("/flocks", {
        headers: { "X-User-Email": userEmail },
      });
      setFlocks(res.data);
    } catch (err) {
      console.error("Error fetching flocks:", err);
    }
  };

  useEffect(() => {
    fetchFlocks();
  }, []);

  // ✅ Add or update flock
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name: flockName, size: parseInt(flockSize), userEmail };

    try {
      if (editingId) {
        await api.put(`/flocks/${editingId}`, payload, {
          headers: { "X-User-Email": userEmail },
        });
      } else {
        await api.post("/flocks", payload, {
          headers: { "X-User-Email": userEmail },
        });
      }
      setFlockName("");
      setFlockSize("");
      setEditingId(null);
      fetchFlocks();
    } catch (err) {
      console.error("Error saving flock:", err);
    }
  };

  // ✅ Delete flock
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this flock?")) return;
    try {
      await api.delete(`/flocks/${id}`, {
        headers: { "X-User-Email": userEmail },
      });
      fetchFlocks();
    } catch (err) {
      console.error("Error deleting flock:", err);
    }
  };

  // ✅ Edit flock
  const handleEdit = (flock) => {
    setEditingId(flock.id);
    setFlockName(flock.name);
    setFlockSize(flock.size.toString());
  };

  const totalBirds = flocks.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="flex flex-col items-center px-4 py-6 space-y-6 w-full max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">🐓 Flock Management</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full bg-light-bg dark:bg-dark-card shadow p-6 rounded-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Flock Name"
            value={flockName}
            onChange={(e) => setFlockName(e.target.value)}
            className="w-full border p-2 rounded border-light-muted dark:border-dark-dim bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text"
            required
          />
          <input
            type="number"
            placeholder="Flock Size"
            value={flockSize}
            onChange={(e) => setFlockSize(e.target.value)}
            className="w-full border p-2 rounded border-light-muted dark:border-dark-dim bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text"
            required
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            {editingId ? "✏️ Update Flock" : "➕ Add Flock"}
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

      {/* Flocks Table */}
      <div className="w-full overflow-x-auto">
        <table className="min-w-full text-left bg-light-bg dark:bg-dark-card shadow rounded-xl">
          <thead>
            <tr className="border-b border-light-muted dark:border-dark-dim">
              <th className="p-2 text-light-text dark:text-dark-text">#</th>
              <th className="p-2 text-light-text dark:text-dark-text">Name</th>
              <th className="p-2 text-light-text dark:text-dark-text">Size</th>
              <th className="p-2 text-light-text dark:text-dark-text">Actions</th>
            </tr>
          </thead>
          <tbody>
            {flocks.length > 0 ? (
              flocks.map((flock, index) => (
                <tr key={flock.id} className="border-b border-light-muted dark:border-dark-dim">
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2">{flock.name}</td>
                  <td className="p-2">{flock.size} birds</td>
                  <td className="p-2 space-x-2">
                    <button
                      onClick={() => handleEdit(flock)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(flock.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-4 text-center text-light-subtext dark:text-dark-subtext">
                  No flocks added yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Total Birds Summary */}
      <div className="w-full p-4 bg-light-card dark:bg-dark-card/20 rounded-xl font-semibold text-light-text dark:text-dark-text text-center">
        🐥 Total Birds in All Flocks: {totalBirds}
      </div>
    </div>
  );
}
