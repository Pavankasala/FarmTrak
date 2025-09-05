// src/pages/FeedPredictor.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/api";
import { getCurrentUser } from "../utils/login";

export default function FeedPredictor() {
  const userEmail = getCurrentUser();

  const [birdType, setBirdType] = useState("broiler");
  const [customBird, setCustomBird] = useState("");
  const [numBirds, setNumBirds] = useState("");
  const [totalFeedGiven, setTotalFeedGiven] = useState("");
  const [feedUnit, setFeedUnit] = useState("kg");
  const [daysLasted, setDaysLasted] = useState(1);
  const [resultUnit, setResultUnit] = useState("kg");
  const [result, setResult] = useState(null);
  const [records, setRecords] = useState([]);
  const [editId, setEditId] = useState(null);

  // Fetch all feed records
  const fetchRecords = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/feedRecords`, {
        headers: { "X-User-Email": userEmail },
      });
      setRecords(res.data || []);
    } catch (err) {
      console.error("Error fetching feed records:", err);
    }
  };

  useEffect(() => { fetchRecords(); }, [userEmail]);

  // Calculate feed result
  const calculateFeed = () => {
    const birds = parseFloat(numBirds);
    const totalFeed = parseFloat(totalFeedGiven);
    const days = parseInt(daysLasted);

    if (!birds || !totalFeed || !days || birds <= 0 || totalFeed <= 0 || days <= 0) {
      setResult("Please enter valid numbers.");
      return;
    }

    const feedKg = feedUnit === "g" ? totalFeed / 1000 : totalFeed;
    const perBirdPerDayKg = feedKg / birds / days;
    const totalPerDayKg = feedKg / days;

    setResult({
      perBird: (resultUnit === "g" ? perBirdPerDayKg * 1000 : perBirdPerDayKg).toFixed(2),
      total: (resultUnit === "g" ? totalPerDayKg * 1000 : totalPerDayKg).toFixed(2),
      unit: resultUnit,
    });
  };

  const resetForm = () => {
    setEditId(null);
    setBirdType("broiler");
    setCustomBird("");
    setNumBirds("");
    setTotalFeedGiven("");
    setFeedUnit("kg");
    setDaysLasted(1);
    setResult(null);
  };

  // Save or update record
  const saveRecord = async () => {
    if (!result) return;

    const birds = parseInt(numBirds, 10);
    const totalFeed = parseFloat(totalFeedGiven);
    const days = parseInt(daysLasted, 10);

    const birdName = birdType === "other" ? customBird || "Other" : birdType;
    const totalFeedKg = feedUnit === "g" ? totalFeed / 1000 : totalFeed;
    const payload = {
      numBirds: birds,
      birdType,
      customBird: birdType === "other" ? customBird : "",
      totalFeedGiven: totalFeedKg,
      unit: "kg",
      daysLasted: days,
      feedPerDay: totalFeedKg / days,
      feedPerBird: totalFeedKg / birds / days,
      birdName,
      date: new Date().toISOString(),
    };

    try {
      if (editId) {
        const res = await axios.put(`${API_BASE_URL}/feedRecords/${editId}`, payload, {
          headers: { "X-User-Email": userEmail },
        });
        setRecords(records.map(r => (r.id === editId ? res.data : r)));
      } else {
        const res = await axios.post(`${API_BASE_URL}/feedRecords`, payload, {
          headers: { "X-User-Email": userEmail },
        });
        setRecords([res.data, ...records]);
      }
      resetForm();
    } catch (err) {
      console.error("Error saving feed record:", err);
    }
  };
  // Edit record
  const handleEdit = (record) => {
    setEditId(record.id);

    if (record.birdType === "other") {
      setBirdType("other");
      setCustomBird(record.customBird || "Other");
    } else {
      setBirdType(record.birdType || "broiler");
      setCustomBird("");
    }

    setNumBirds(record.numBirds);
    setTotalFeedGiven(record.totalFeedGiven);
    setFeedUnit("kg");
    setDaysLasted(record.daysLasted);

    const perBird = resultUnit === "g" ? record.feedPerBird * 1000 : record.feedPerBird;
    const total = resultUnit === "g" ? record.feedPerDay * record.daysLasted * 1000 : record.feedPerDay * record.daysLasted;

    setResult({
      perBird: perBird.toFixed(2),
      total: total.toFixed(2),
      unit: resultUnit,
      date: record.date,
    });
  };

  // Delete record
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/feedRecords/${id}`, { headers: { "X-User-Email": userEmail } });
      setRecords(records.filter(r => r.id !== id));
    } catch (err) {
      console.error("Error deleting record:", err);
    }
  };

  return (
    <div className="flex flex-col items-center px-4 py-6 space-y-6 w-full max-w-4xl mx-auto">
      {/* ... form and table JSX remains the same ... */}
    </div>
  );
}
