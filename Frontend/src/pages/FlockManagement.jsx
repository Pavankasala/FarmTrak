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
    try {
      if (editingId) {
        await api.put(
          `/flocks/${editingId}`,
          { name: flockName, size: flockSize },
          { headers: { "X-User-Email": userEmail } }
        );
      } else {
        await api.post(
          "/flocks",
          { name: flockName, size: flockSize },
          { headers: { "X-User-Email": userEmail } }
        );
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
    setFlockSize(flock.size);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Flock Management</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Flock Name"
          value={flockName}
          onChange={(e) => setFlockName(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="number"
          placeholder="Flock Size"
          value={flockSize}
          onChange={(e) => setFlockSize(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {editingId ? "Update" : "Add"} Flock
        </button>
      </form>

      <ul className="mt-6 space-y-2">
        {flocks.map((flock) => (
          <li
            key={flock.id}
            className="flex justify-between items-center border p-3 rounded"
          >
            <span>
              {flock.name} - {flock.size} birds
            </span>
            <div className="space-x-2">
              <button
                onClick={() => handleEdit(flock)}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(flock.id)}
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
