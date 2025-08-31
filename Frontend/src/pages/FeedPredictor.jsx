// Frontend/src/components/FeedPredictor.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/api";
import { getCurrentUser } from "../utils/login";

export default function FeedPredictor({ flockId }) {
  const userEmail = getCurrentUser();

  const [numBirds, setNumBirds] = useState("");
  const [birdType, setBirdType] = useState("Broiler"); // Capitalized to match flock data
  const [unit, setUnit] = useState("kg");
  const [totalFeedGiven, setTotalFeedGiven] = useState("");
  const [daysLasted, setDaysLasted] = useState("");
  const [result, setResult] = useState(null);

  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // ✅ Fetch records from backend
  useEffect(() => {
    if (userEmail && flockId) {
      axios
        .get(`${API_BASE_URL}/api/feedRecords`, {
          params: { flockId, userEmail },
        })
        .then((res) => setRecords(res.data))
        .catch((err) => console.error("Error fetching feed records:", err));
    }
  }, [flockId, userEmail]);

  // ✅ Calculate feed requirement
  const calculateFeed = async () => {
    if (!numBirds || !totalFeedGiven || !daysLasted) {
      alert("Please enter all values");
      return;
    }

    let totalFeedInKg = parseFloat(totalFeedGiven);
    if (unit === "g") totalFeedInKg = totalFeedInKg / 1000;

    const feedPerDay = totalFeedInKg / parseFloat(daysLasted);
    const feedPerBird = (feedPerDay * 1000) / parseInt(numBirds);

    const newRecord = {
      id: editingId || null,
      flockId,
      userEmail,
      numBirds,
      birdType,
      totalFeedGiven,
      unit,
      daysLasted,
      feedPerDay: feedPerDay.toFixed(2),
      feedPerBird: feedPerBird.toFixed(2),
    };

    try {
      if (editingId) {
        // Update existing record
        const res = await axios.put(
          `${API_BASE_URL}/api/feedRecords/${editingId}`,
          newRecord
        );
        setRecords(records.map((r) => (r.id === editingId ? res.data : r)));
        setEditingId(null);
      } else {
        // Add new record
        const res = await axios.post(`${API_BASE_URL}/api/feedRecords`, newRecord);
        setRecords([...records, res.data]);
      }
      setResult({
        feedPerDay: newRecord.feedPerDay,
        feedPerBird: newRecord.feedPerBird,
        unit: newRecord.unit,
      });
      resetForm(false); // don't reset birdType every time
    } catch (err) {
      console.error("Error saving feed record:", err);
      alert("Failed to save feed record");
    }
  };

  // ✅ Reset form
  const resetForm = (resetBirdType = true) => {
    setNumBirds("");
    setTotalFeedGiven("");
    setDaysLasted("");
    setResult(null);
    setEditingId(null);
    if (resetBirdType) setBirdType("Broiler");
  };

  // ✅ Edit record
  const handleEdit = (rec) => {
    setNumBirds(rec.numBirds);
    setBirdType(rec.birdType);
    setTotalFeedGiven(rec.totalFeedGiven);
    setUnit(rec.unit);
    setDaysLasted(rec.daysLasted);
    setEditingId(rec.id);
    setResult({
      feedPerDay: rec.feedPerDay,
      feedPerBird: rec.feedPerBird,
      unit: rec.unit,
    });
  };

  // ✅ Delete record
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/feedRecords/${id}`);
      setRecords(records.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error deleting record:", err);
      alert("Failed to delete record");
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow mt-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        🐔 Feed Predictor
      </h2>

      {/* Input Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="number"
          value={numBirds}
          onChange={(e) => setNumBirds(e.target.value)}
          placeholder="Number of Birds"
          className="border rounded p-2 dark:bg-gray-700 dark:text-white"
        />

        <select
          value={birdType}
          onChange={(e) => setBirdType(e.target.value)}
          className="border rounded p-2 dark:bg-gray-700 dark:text-white"
        >
          <option value="Broiler">Broiler</option>
          <option value="Layer">Layer</option>
          <option value="Other">Other</option>
        </select>

        <div className="flex">
          <input
            type="number"
            value={totalFeedGiven}
            onChange={(e) => setTotalFeedGiven(e.target.value)}
            placeholder="Total Feed Given"
            className="border rounded p-2 flex-1 dark:bg-gray-700 dark:text-white"
          />
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="border rounded p-2 ml-2 dark:bg-gray-700 dark:text-white"
          >
            <option value="kg">kg</option>
            <option value="g">g</option>
          </select>
        </div>

        <input
          type="number"
          value={daysLasted}
          onChange={(e) => setDaysLasted(e.target.value)}
          placeholder="Days Lasted"
          className="border rounded p-2 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex space-x-2">
        <button
          onClick={calculateFeed}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {editingId ? "Update Record" : "Calculate & Save"}
        </button>
        <button
          onClick={() => resetForm()}
          className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
        >
          Reset
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="mt-4 p-4 bg-green-100 text-green-800 rounded">
          ✅ Estimated Feed Requirement: <br />
          <strong>
            Per bird/day: {result.feedPerBird} g | Total/day: {result.feedPerDay} {result.unit}
          </strong>
        </div>
      )}

      {/* Records Table */}
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">
        📋 Saved Records
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-700 border rounded mt-2">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-600">
              <th className="p-2">Birds</th>
              <th className="p-2">Type</th>
              <th className="p-2">Feed Given</th>
              <th className="p-2">Days</th>
              <th className="p-2">Feed/Day</th>
              <th className="p-2">Feed/Bird</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec) => (
              <tr key={rec.id} className="text-center border-t">
                <td className="p-2">{rec.numBirds}</td>
                <td className="p-2">{rec.birdType}</td>
                <td className="p-2">
                  {rec.totalFeedGiven} {rec.unit}
                </td>
                <td className="p-2">{rec.daysLasted}</td>
                <td className="p-2">
                  {rec.feedPerDay} {rec.unit}
                </td>
                <td className="p-2">{rec.feedPerBird} g</td>
                <td className="p-2 space-x-2">
                  <button
                    onClick={() => handleEdit(rec)}
                    className="px-2 py-1 bg-yellow-500 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(rec.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
