// src/components/CallContacts.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CallContacts() {

  const userId = "U12345";

  const [contacts, setContacts] = useState([]);
  const [loading,  setLoading ] = useState(true);
  const [error,    setError   ] = useState(null);

  /* --- fetch once on mount --- */
  useEffect(() => {
    axios
      .get(`https://localhost:4000/contacts/getAll/${userId}`)
      .then((res) => setContacts(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  /* --- CONDITIONAL RENDERING --- */
  if (loading) return <p className="text-center">Loading…</p>;
  if (error)   return <p className="text-center text-red-600">{error}</p>;

  /* --- MAIN JSX --- */
  return (
    <div className="min-h-screen bg-slate-400 p-6">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Call Contacts
      </h2>

      <div className="grid gap-6 max-w-md mx-auto">
        {contacts.map((c) => (
          <div
            key={c._id}
            className="bg-white rounded-2xl shadow-md p-6 flex items-center justify-between"
          >
            <div className="text-lg font-medium text-gray-900">
              {c.fullName} ({c.relationship})
            </div>
            <a
              href={`tel:${c.phoneNumber}`}
              className="bg-blue-900 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition"
            >
              Call
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
