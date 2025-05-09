// src/components/Medication.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Medication() {
  /* ← החליפי ב-ID האמיתי (Context / Login) */
  const userId = "U12345";

  /* ---------- state ---------- */
  const [meds,      setMeds]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  /* טופס Add-Medication */
  const [isAdding,  setIsAdding]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [form,      setForm]      = useState({
    name:        "",
    dosage:      "",
    frequency:   "",
    lastTaken:   "",
    nextDue:     "",
  });

  /* ---------- fetch once ---------- */
  useEffect(() => {
    axios
      .get(`https://localhost:4000/medications/getAll/${userId}`)
      .then((res) => setMeds(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  /* ---------- mark as taken ---------- */
  const markTaken = (index, id) => {
    setMeds((prev) => {
      const updated      = [...prev];
      updated[index]     = { ...updated[index], taken: true, lastTaken: new Date().toISOString() };
      return updated;
    });

    axios.put(`https://localhost:4000/medications/markTaken/${id}`).catch(console.error);
  };

  /* ---------- Add-Medication handlers ---------- */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = () => {
    if (!form.name || !form.dosage) {
      alert("Please fill required fields");
      return;
    }
    setSaving(true);
    axios
      .post("https://localhost:4000/medications/addMedication", {
        userId,
        ...form,
      })
      .then((res) => {
        setMeds((prev) => [...prev, res.data]);
        setIsAdding(false);
        setForm({ name: "", dosage: "", frequency: "", lastTaken: "", nextDue: "" });
      })
      .catch((err) => alert(err.response?.data?.message || err.message))
      .finally(() => setSaving(false));
  };

  const handleCancel = () => {
    setIsAdding(false);
    setForm({ name: "", dosage: "", frequency: "", lastTaken: "", nextDue: "" });
  };

  /* ---------- conditional ---------- */
  if (loading) return <p className="text-center">Loading…</p>;
  if (error)   return <p className="text-center text-red-600">{error}</p>;

  /* ---------- JSX ---------- */
  return (
    <div className="min-h-screen bg-slate-400 p-6">
      {/* Label + the bottun position*/}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Medication</h2>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-900 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-xl transition"
          >
            Add Medication
          </button>
        )}
      </div>

      {/* טופס הוספה */}
      {isAdding && (
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-md p-6 mb-6 space-y-6">
          {[
            { label: "Medication Name", name: "name", placeholder: "Aspirin", required: true },
            { label: "Dosage",          name: "dosage", placeholder: "100 mg", required: true },
            { label: "Frequency",       name: "frequency", placeholder: "Twice a day" },
            { label: "Last Taken (ISO)",name: "lastTaken", placeholder: "2025-05-08T08:00" },
            { label: "Next Due (ISO)",  name: "nextDue", placeholder: "2025-05-08T20:00" },
          ].map((f) => (
            <div key={f.name}>
              <label className="block text-lg font-semibold text-gray-700">
                {f.label}{f.required && " *"}
              </label>
              <input
                name={f.name}
                value={form[f.name]}
                onChange={handleChange}
                placeholder={f.placeholder}
                className="mt-2 w-full rounded-md
                           border-2 border-blue-900
                           focus:border-blue-700 focus:ring-blue-700
                           text-lg px-4 py-3"
              />
            </div>
          ))}

          <div className="flex justify-end gap-4">
            <button
              onClick={handleCancel}
              className="px-5 py-2 rounded-xl bg-gray-300 hover:bg-gray-400 transition text-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 rounded-xl text-white font-semibold transition
                         bg-blue-900 hover:bg-blue-700 disabled:opacity-60 text-lg"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* רשימת תרופות */}
      <div className="grid gap-6 max-w-md mx-auto">
        {meds.map((m, i) => (
          <div
            key={m._id}
            className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-2"
          >
            <div className="text-xl font-semibold text-gray-900">{m.name}</div>
            <div className="text-gray-700 text-sm">Dosage: {m.dosage}</div>
            {m.frequency && <div className="text-gray-700 text-sm">Frequency: {m.frequency}</div>}
            <div className="text-gray-600 text-sm">
              Last taken:&nbsp;
              {m.lastTaken ? new Date(m.lastTaken).toLocaleString() : "Never"}
            </div>

            <button
              onClick={() => markTaken(i, m._id)}
              disabled={m.taken}
              className={`mt-2 py-2 px-4 rounded-xl text-white font-semibold transition ${
                m.taken
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-900 hover:bg-blue-700"
              }`}
            >
              {m.taken ? "Already Taken" : "Mark as Taken"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
