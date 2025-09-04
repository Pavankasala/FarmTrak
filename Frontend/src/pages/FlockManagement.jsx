// Frontend/src/pages/FlockManagement.jsx
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../utils/api";

export default function FlockManagement() {
  const [flocks, setFlocks] = useState([]);
  const [newFlock, setNewFlock] = useState({ type: "Broiler", customType: "", quantity: "", age: "" });
  const [editingId, setEditingId] = useState(null);
  const [editedFlock, setEditedFlock] = useState({ type: "Broiler", customType: "", quantity: "", age: "" });

  const userEmail = localStorage.getItem("userEmail");

  const fetchFlocks = async () => {
    if (!userEmail) return;
    try {
      const response = await fetch(`${API_BASE_URL}/flocks`, {
        headers: { "X-User-Email": userEmail },
      });
      if (!response.ok) throw new Error("Failed to fetch flocks");
      const data = await response.json();
      setFlocks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddFlock = async () => {
    if (!userEmail) return alert("User not logged in!");

    const finalType = newFlock.type === "Other" ? newFlock.customType.trim() : newFlock.type;
    if (!finalType || !newFlock.quantity || !newFlock.age) return;

    const newEntry = {
      type: finalType,
      quantity: parseInt(newFlock.quantity),
      age: parseInt(newFlock.age),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/flocks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": userEmail,
        },
        body: JSON.stringify(newEntry),
      });
      if (response.ok) {
        setNewFlock({ type: "Broiler", customType: "", quantity: "", age: "" });
        fetchFlocks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this flock?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/flocks/${id}`, {
        method: "DELETE",
        headers: { "X-User-Email": userEmail },
      });
      if (response.ok) fetchFlocks();
    } catch (err) {
      console.error(err);
    }
  };

  const startEditing = (flock) => {
    setEditingId(flock.id);
    setEditedFlock({ type: flock.type, customType: "", quantity: flock.quantity, age: flock.age });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditedFlock({ type: "Broiler", customType: "", quantity: "", age: "" });
  };

  const handleUpdate = async () => {
    if (!userEmail) return alert("User not logged in!");

    const finalType = editedFlock.type === "Other" ? editedFlock.customType.trim() : editedFlock.type;
    if (!finalType || !editedFlock.quantity || !editedFlock.age) return;

    try {
      const response = await fetch(`${API_BASE_URL}/flocks/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": userEmail,
        },
        body: JSON.stringify({
          type: finalType,
          quantity: parseInt(editedFlock.quantity),
          age: parseInt(editedFlock.age),
        }),
      });
      if (response.ok) {
        setEditingId(null);
        setEditedFlock({ type: "Broiler", customType: "", quantity: "", age: "" });
        fetchFlocks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (userEmail) fetchFlocks();
  }, [userEmail]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center">🐓 Flock Management</h1>

      <div className="bg-light-bg dark:bg-dark-card shadow p-6 rounded-xl w-full transition-colors">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="font-semibold text-gray-900 dark:text-white">Bird Type</label>
            <select
              value={newFlock.type}
              onChange={(e) => setNewFlock({ ...newFlock, type: e.target.value })}
              className="w-full border p-2 rounded mt-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="Broiler">Broiler</option>
              <option value="Layer">Layer</option>
              <option value="Other">Other</option>
            </select>
            {newFlock.type === "Other" && (
              <input
                type="text"
                value={newFlock.customType}
                onChange={(e) => setNewFlock({ ...newFlock, customType: e.target.value })}
                placeholder="Custom name"
                className="mt-1 w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            )}
          </div>

          <div>
            <label className="font-semibold text-gray-900 dark:text-white">Quantity</label>
            <input
              type="number"
              value={newFlock.quantity}
              onChange={(e) => setNewFlock({ ...newFlock, quantity: e.target.value })}
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
            {flocks.map((flock) =>
              editingId === flock.id ? (
                <tr key={flock.id} className="border-b dark:border-gray-700">
                  <td className="p-2">
                    <select
                      value={editedFlock.type}
                      onChange={(e) => setEditedFlock({ ...editedFlock, type: e.target.value })}
                      className="w-full border p-1 rounded dark:bg-gray-800 dark:text-white"
                    >
                      <option value="Broiler">Broiler</option>
                      <option value="Layer">Layer</option>
                      <option value="Other">Other</option>
                    </select>
                    {editedFlock.type === "Other" && (
                      <input
                        type="text"
                        value={editedFlock.customType}
                        onChange={(e) => setEditedFlock({ ...editedFlock, customType: e.target.value })}
                        placeholder="Enter species name"
                        className="mt-1 w-full border p-1 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    )}
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={editedFlock.quantity}
                      onChange={(e) => setEditedFlock({ ...editedFlock, quantity: e.target.value })}
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
                  <td className="p-2 text-gray-900 dark:text-white">{flock.type}</td>
                  <td className="p-2 text-gray-900 dark:text-white">{flock.quantity}</td>
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
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
