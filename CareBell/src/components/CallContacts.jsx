// src/components/CallContacts.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CallContacts() {
  const userId = "U12345";

  /* ---------- state ---------- */
  const [contacts,   setContacts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const [isAdding,   setIsAdding]   = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [form,       setForm]       = useState({
    fullName: "",
    phoneNumber: "",
    relationship: "",
  });

  /* ---------- fetch once ---------- */
  useEffect(() => {
    axios
      .get(`https://localhost:4000/contacts/getAll/${userId}`)
      .then((res) => setContacts(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  /* ---------- handlers ---------- */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = () => {
    if (!form.fullName || !form.phoneNumber) {
      alert("Please fill all fields");
      return;
    }
    setSaving(true);
    axios
      .post("https://localhost:4000/contacts/addContact", { userId, ...form })
      .then((res) => {
        setContacts((prev) => [...prev, res.data]);
        setIsAdding(false);
        setForm({ fullName: "", phoneNumber: "", relationship: "" });
      })
      .catch((err) => alert(err.response?.data?.message || err.message))
      .finally(() => setSaving(false));
  };

  const handleCancel = () => {
    setIsAdding(false);
    setForm({ fullName: "", phoneNumber: "", relationship: "" });
  };

  /* ---------- conditional rendering ---------- */
  if (loading) return <p className="text-center">Loading…</p>;
  if (error)   return <p className="text-center text-red-600">{error}</p>;

  /* ---------- JSX ---------- */
  return (
    <div className="min-h-screen bg-slate-400 p-6">
      {/* כותרת + כפתור הוספה בקצה ימין */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Call Contacts</h2>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-900 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-xl transition"
          >
            Add Contact
          </button>
        )}
      </div>

      {/* טופס הוספה */}
      {isAdding && (
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-md p-6 mb-6 space-y-6">
          {/* full name */}
          <div>
            <label className="block text-lg font-semibold text-gray-700">
              Full Name
            </label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="e.g. Michael Cohen"
              className="mt-2 w-full rounded-md
                         border-2 border-blue-900
                         focus:border-blue-700 focus:ring-blue-700
                         text-lg px-4 py-3"
            />
          </div>

          {/* phone */}
          <div>
            <label className="block text-lg font-semibold text-gray-700">
              Phone Number
            </label>
            <input
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              placeholder="050-1234567"
              className="mt-2 w-full rounded-md
                         border-2 border-blue-900
                         focus:border-blue-700 focus:ring-blue-700
                         text-lg px-4 py-3"
            />
          </div>

          {/* relationship */}
          <div>
            <label className="block text-lg font-semibold text-gray-700">
              Relationship
            </label>
            <input
              name="relationship"
              value={form.relationship}
              onChange={handleChange}
              placeholder="Son / Daughter / Friend…"
              className="mt-2 w-full rounded-md
                         border-2 border-blue-900
                         focus:border-blue-700 focus:ring-blue-700
                         text-lg px-4 py-3"
            />
          </div>

          {/* buttons */}
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

      {/* רשימת אנשי קשר */}
      <div className="grid gap-6 max-w-md mx-auto">
        {contacts.map((c) => (
          <div
            key={c._id}
            className="bg-white rounded-2xl shadow-md p-6 flex items-center justify-between"
          >
            <div className="text-xl font-medium text-gray-900">
              {c.fullName} ({c.relationship})
            </div>
            <a
              href={`tel:${c.phoneNumber}`}
              className="bg-blue-900 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-xl transition text-lg"
            >
              Call
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
