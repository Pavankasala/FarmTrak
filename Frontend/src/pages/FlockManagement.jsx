// Frontend/src/pages/FlockManagement.jsx
import { useEffect, useState } from "react";
import { api } from "../utils/api";
import { getCurrentUser } from "../utils/login";

export default function FlockManagement() {
  const userEmail = getCurrentUser();

  const [flocks, setFlocks] = useState([]);
  const [newFlock, setNewFlock] = useState({ birdType: "Broiler", customBird: "", numBirds: "", age: "" });
  const [editingId, setEditingId] = useState(null);
  const [editedFlock, setEditedFlock] = useState({ birdType: "Broiler", customBird: "", numBirds: "", age: "" });

  const fetchFlocks = async () => {
    if (!userEmail) return;
    try {
      const res = await api.get("/flocks", { headers: { "X-User-Email": userEmail } });
      setFlocks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch flocks:", err);
    }
  };

  const handleAddFlock = async () => {
    if (!userEmail) return alert("User not logged in!");

    const finalBirdType = newFlock.birdType === "Other" ? "Other" : newFlock.birdType;
    const payload = {
      birdType: finalBirdType,
      customBird: newFlock.birdType === "Other" ? newFlock.customBird.trim() : null,
      numBirds: parseInt(newFlock.numBirds),
      age: parseInt(newFlock.age),
    };

    if (!payload.birdType || !payload.numBirds || !payload.age) return;

    try {
      await api.post("/flocks", payload, { headers: { "X-User-Email": userEmail } });
      setNewFlock({ birdType: "Broiler", customBird: "", numBirds: "", age: "" });
      fetchFlocks();
    } catch (err) {
      console.error("Failed to add flock:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this flock?")) return;
    try {
      await api.delete(`/flocks/${id}`, { headers: { "X-User-Email": userEmail } });
      fetchFlocks();
    } catch (err) {
      console.error("Failed to delete flock:", err);
    }
  };

  const startEditing = (flock) => {
    setEditingId(flock.id);
    setEditedFlock({
      birdType: flock.birdType,
      customBird: flock.customBird || "",
      numBirds: flock.numBirds,
      age: flock.age,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditedFlock({ birdType: "Broiler", customBird: "", numBirds: "", age: "" });
  };

  const handleUpdate = async () => {
    if (!userEmail) return alert("User not logged in!");

    const finalBirdType = editedFlock.birdType === "Other" ? "Other" : editedFlock.birdType;
    const payload = {
      birdType: finalBirdType,
      customBird: editedFlock.birdType === "Other" ? editedFlock.customBird.trim() : null,
      numBirds: parseInt(editedFlock.numBirds),
      age: parseInt(editedFlock.age),
    };

    if (!payload.birdType || !payload.numBirds || !payload.age) return;

    try {
      await api.put(`/flocks/${editingId}`, payload, { headers: { "X-User-Email": userEmail } });
      setEditingId(null);
      setEditedFlock({ birdType: "Broiler", customBird: "", numBirds: "", age: "" });
      fetchFlocks();
    } catch (err) {
      console.error("Failed to update flock:", err);
    }
  };

  useEffect(() => {
    if (userEmail) fetchFlocks();
  }, [userEmail]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center">🐓 Flock Management</h1>

      {/* Add Flock Form */}
      <div className="bg-light-bg dark:bg-dark-card shadow p-6 rounded-xl w-full transition-colors">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="font-semibold text-gray-900 dark:text-white">Bird Type</label>
            <select
              value={newFlock.birdType}
              onChange={(e) => setNewFlock({ ...newFlock, birdType: e.target.value })}
              className="w-full border p-2 rounded mt-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="Broiler">Broiler</option>
              <option value="Layer">Layer</option>
              <option value="Other">Other</option>
            </select>
            {newFlock.birdType === "Other" && (
              <input
                type="text"
                value={newFlock.customBird}
                onChange={(e) => setNewFlock({ ...newFlock, customBird: e.target.value })}
                placeholder="Custom name"
                className="mt-1 w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            )}
          </div>

          <div>
            <label className="font-semibold text-gray-900 dark:text-white">Quantity</label>
            <input
              type="number"
              value={newFlock.numBirds}
              onChange={(e) => setNewFlock({ ...newFlock, numBirds: e.target.value })}
              className="w-full border p-2 rounded mt-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-900 dark:text-white">Age (weeks)</label>
            <input
              type="number"
              value={newFlock.age}
              onChange={(e) => setNewFlock({ ...newFlock, age: e.target.value })}
              className="w-full border p-2 rounded mt-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleAddFlock}
              className="bg-green-600 text-white px-4 py-2 rounded w-full sm:w-auto hover:bg-green-700 transition-colors"
            >
              ➕ Add Flock
            </button>
          </div>
        </div>
      </div>

      {/* Flocks Table */}
      <div className="bg-light-bg dark:bg-dark-card shadow p-4 rounded-xl overflow-x-auto transition-colors">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white text-center">📋 Current Flocks</h2>
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="p-2 text-gray-900 dark:text-white">Type</th>
              <th className="p-2 text-gray-900 dark:text-white">Quantity</th>
              <th className="p-2 text-gray-900 dark:text-white">Age (weeks)</th>
              <th className="p-2 text-gray-900 dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {flocks.length > 0 ? (
              flocks.map((flock) =>
                editingId === flock.id ? (
                  <tr key={flock.id} className="border-b dark:border-gray-700">
                    <td className="p-2">
                      <select
                        value={editedFlock.birdType}
                        onChange={(e) => setEditedFlock({ ...editedFlock, birdType: e.target.value })}
                        className="w-full border p-1 rounded dark:bg-gray-800 dark:text-white"
                      >
                        <option value="Broiler">Broiler</option>
                        <option value="Layer">Layer</option>
                        <option value="Other">Other</option>
                      </select>
                      {editedFlock.birdType === "Other" && (
                        <input
                          type="text"
                          value={editedFlock.customBird}
                          onChange={(e) => setEditedFlock({ ...editedFlock, customBird: e.target.value })}
                          placeholder="Enter species name"
                          className="mt-1 w-full border p-1 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                      )}
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={editedFlock.numBirds}
                        onChange={(e) => setEditedFlock({ ...editedFlock, numBirds: e.target.value })}
                        className="w-full border p-1 rounded dark:bg-gray-800 dark:text-white"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={editedFlock.age}
                        onChange={(e) => setEditedFlock({ ...editedFlock, age: e.target.value })}
                        className="w-full border p-1 rounded dark:bg-gray-800 dark:text-white"
                      />
                    </td>
                    <td className="p-2 flex flex-wrap gap-2">
                      <button onClick={handleUpdate} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors">
                        Save
                      </button>
                      <button onClick={cancelEdit} className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors">
                        Cancel
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={flock.id} className="border-b dark:border-gray-700">
                    <td className="p-2 text-gray-900 dark:text-white">
                      {flock.birdType === "Other" ? flock.customBird : flock.birdType}
                    </td>
                    <td className="p-2 text-gray-900 dark:text-white">{flock.numBirds}</td>
                    <td className="p-2 text-gray-900 dark:text-white">{flock.age}</td>
                    <td className="p-2 flex flex-wrap gap-2">
                      <button onClick={() => startEditing(flock)} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(flock.id)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors">
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              )
            ) : (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No flocks recorded yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
