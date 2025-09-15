// src/pages/FlockManagement.jsx
import { useEffect, useState } from "react";
import { apiClient } from "../utils/apiClient";
import { getCurrentUser } from "../utils/login";
import TableCard from "../components/TableCard";
import Tooltip from "../components/Tooltip";

export default function FlockManagement() {
  const userEmail = getCurrentUser();
  const [flocks, setFlocks] = useState([]);
  const [newFlock, setNewFlock] = useState({ birdType: "Broiler", customBird: "", numBirds: "", age: "" });
  const [editingId, setEditingId] = useState(null);
  const [editedFlock, setEditedFlock] = useState({ birdType: "Broiler", customBird: "", numBirds: "", age: "" });
  const [loading, setLoading] = useState(false);

  const fetchFlocks = async () => {
    if (!userEmail) return;
    setLoading(true);
    try {
      const res = await apiClient.getFlocks();
      setFlocks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch flocks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userEmail) fetchFlocks();
  }, [userEmail]);

  const handleAddFlock = async () => {
    if (!userEmail) return alert("User not logged in!");
    const finalBirdType = newFlock.birdType === "Other" ? "Other" : newFlock.birdType;
    const payload = {
      birdType: finalBirdType,
      customBird: newFlock.birdType === "Other" ? (newFlock.customBird || null) : null,
      numBirds: parseInt(newFlock.numBirds, 10) || 0,
      age: parseInt(newFlock.age, 10) || 0,
    };
    if (!payload.birdType || payload.numBirds <= 0 || payload.age < 0) return alert("Please fill valid flock details.");
    try {
      await apiClient.saveFlock(payload);
      setNewFlock({ birdType: "Broiler", customBird: "", numBirds: "", age: "" });
      fetchFlocks();
    } catch (err) {
      console.error("Failed to add flock:", err);
      alert("Failed to add flock.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this flock?")) return;
    try {
      await apiClient.deleteFlock(id);
      fetchFlocks();
    } catch (err) {
      console.error("Failed to delete flock:", err);
      alert("Failed to delete flock.");
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
      customBird: editedFlock.birdType === "Other" ? (editedFlock.customBird || null) : null,
      numBirds: parseInt(editedFlock.numBirds, 10) || 0,
      age: parseInt(editedFlock.age, 10) || 0,
    };
    if (!payload.birdType || payload.numBirds <= 0 || payload.age < 0) return alert("Please fill valid flock details.");
    try {
      await apiClient.updateFlock(editingId, payload);
      cancelEdit();
      fetchFlocks();
    } catch (err) {
      console.error("Failed to update flock:", err);
      alert("Failed to update flock.");
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center">🐓 Flock Management</h1>

      <div className="bg-white dark:bg-white/5 shadow-lg p-6 rounded-2xl w-full transition-colors">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="font-semibold text-gray-900 dark:text-white">
              Bird Type <Tooltip text="Select bird type: Broiler, Layer, or Other species" />
            </label>
            <select
              value={newFlock.birdType}
              onChange={(e) => setNewFlock({ ...newFlock, birdType: e.target.value })}
              className="w-full border p-2 rounded mt-1 dark:bg-gray-800 dark:text-white"
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
                className="mt-1 w-full border p-2 rounded dark:bg-gray-800 dark:text-white"
              />
            )}
          </div>

          <div>
            <label className="font-semibold text-gray-900 dark:text-white">
              Quantity <Tooltip text="Number of birds in this flock" />
            </label>
            <input
              type="number"
              value={newFlock.numBirds}
              onChange={(e) => setNewFlock({ ...newFlock, numBirds: e.target.value })}
              className="w-full border p-2 rounded mt-1 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-900 dark:text-white">
              Age (weeks) <Tooltip text="Enter the flock's age in weeks" />
            </label>
            <input
              type="number"
              value={newFlock.age}
              onChange={(e) => setNewFlock({ ...newFlock, age: e.target.value })}
              className="w-full border p-2 rounded mt-1 dark:bg-gray-800 dark:text-white"
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

      <TableCard className="overflow-x-auto bg-white dark:bg-white/5 shadow-lg p-6 rounded-2xl transition-colors">
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
            {loading ? (
              <tr><td colSpan="4" className="p-4 text-center">Loading...</td></tr>
            ) : flocks.length === 0 ? (
              <tr><td colSpan="4" className="p-4 text-center text-gray-500 dark:text-gray-400">No flocks recorded yet</td></tr>
            ) : (
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
                          className="mt-1 w-full border p-1 rounded dark:bg-gray-800 dark:text-white"
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
                    <td className="p-2 flex gap-2">
                      <button onClick={handleUpdate} className="bg-green-600 text-white px-3 py-1 rounded">Save</button>
                      <button onClick={cancelEdit} className="bg-gray-500 text-white px-3 py-1 rounded">Cancel</button>
                    </td>
                  </tr>
                ) : (
                  <tr key={flock.id} className="border-b dark:border-gray-700">
                    <td className="p-2 text-gray-900 dark:text-white">
                      {flock.birdType === "Other" ? flock.customBird || "Other" : flock.birdType}
                    </td>
                    <td className="p-2 text-gray-900 dark:text-white">{flock.numBirds}</td>
                    <td className="p-2 text-gray-900 dark:text-white">{flock.age}</td>
                    <td className="p-2 flex gap-2">
                      <button onClick={() => startEditing(flock)} className="bg-yellow-500 text-white px-3 py-1 rounded">Edit</button>
                      <button onClick={() => handleDelete(flock.id)} className="bg-red-600 text-white px-3 py-1 rounded">Delete</button>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}
