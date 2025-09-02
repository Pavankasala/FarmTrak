// src/components/ProductionTracker.jsx
import { useState, useEffect } from "react";
import { getCurrentUser } from "../utils/login";
import { api } from "../utils/api";

export default function ProductionTracker({ onDataUpdate }) {
  const [flocks, setFlocks] = useState([]);
  const [productions, setProductions] = useState([]);
  const [form, setForm] = useState({ id: null, flockId: "", count: "", date: "" });

  const userEmail = getCurrentUser();

  const loadData = async () => {
    if (!userEmail) return;
    try {
      const [flockRes, prodRes] = await Promise.all([
        api.get("/flocks", { headers: { "X-User-Email": userEmail } }),
        api.get("/eggs", { headers: { "X-User-Email": userEmail } }),
      ]);

      setFlocks(flockRes.data || []);
      setProductions(prodRes.data || []);

      const today = new Date().toISOString().split("T")[0];
      const todayRecords = prodRes.data.filter((p) => p.date === today);
      const totalToday = todayRecords.reduce((sum, p) => sum + p.count, 0);
      onDataUpdate?.({ eggsToday: totalToday });
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  useEffect(() => {
    if (userEmail) loadData();
  }, [userEmail]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.flockId || !form.count || !form.date) return;

    const payload = { flockId: parseInt(form.flockId), count: parseInt(form.count), date: form.date };

    try {
      if (form.id) {
        await api.put(`/eggs/${form.id}`, payload, { headers: { "X-User-Email": userEmail } });
      } else {
        await api.post("/eggs", payload, { headers: { "X-User-Email": userEmail } });
      }
      resetForm();
      await loadData();
    } catch (err) {
      console.error("Error saving production:", err);
    }
  };

  const handleEdit = (prod) => {
    setForm({ id: prod.id, flockId: prod.flockId.toString(), count: prod.count.toString(), date: prod.date });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await api.delete(`/eggs/${id}`, { headers: { "X-User-Email": userEmail } });
      await loadData();
    } catch (err) {
      console.error("Error deleting production:", err);
    }
  };

  const resetForm = () => setForm({ id: null, flockId: "", count: "", date: "" });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">🥚 Egg Production Tracker</h1>
      {/* Form + Table same as before (unchanged) */}
      {/* ... */}
    </div>
  );
}
