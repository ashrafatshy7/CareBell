import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

export default function CallContacts() {
  /* ====== CONFIG ====== */
  const userId = "U12345";                 
  const API    = "https://localhost:4000";  

  /* ====== STATE ====== */
  const [contacts,  setContacts]  = useState([]);
  const [loading,   setLoading ]  = useState(true);
  const [error,     setError   ]  = useState(null);

  /* add-contact   */
  const [isAdding,  setIsAdding]  = useState(false);
  const [saving,    setSaving ]   = useState(false);
  const [form,      setForm   ]   = useState({
    fullName: "", phoneNumber: "", relationship: "",
  });

  /* delete-contact */
  const [confirmId, setConfirmId] = useState(null);

  /* search */
  const [query, setQuery] = useState("");

  /* ====== FETCH ONCE ====== */
  useEffect(() => {
    axios
      .get(`${API}/contacts/getAll/${userId}`)
      .then((res) => setContacts(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  /* ====== DERIVED: FILTER + SORT ====== */
  const visibleContacts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts
      .filter((c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.phoneNumber.includes(q) ||
        c.relationship?.toLowerCase().includes(q)
      )
      .sort((a, b) => a.fullName.localeCompare(b.fullName, undefined, { sensitivity: "base" }));
  }, [contacts, query]);

  /* ====== ADD CONTACT ====== */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = () => {
    if (!form.fullName || !form.phoneNumber) {
      alert("Please fill all fields");
      return;
    }
    setSaving(true);
    axios
      .post(`${API}/contacts/addContact`, { userId, ...form })
      .then((res) => {
        setContacts((prev) => [...prev, res.data]);
        setIsAdding(false);
        setForm({ fullName: "", phoneNumber: "", relationship: "" });
      })
      .catch((err) => alert(err.response?.data?.message || err.message))
      .finally(() => setSaving(false));
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setForm({ fullName: "", phoneNumber: "", relationship: "" });
  };

  /* ====== DELETE CONTACT ====== */
  const askDelete     = (id) => setConfirmId(id);
  const cancelDelete  = ()  => setConfirmId(null);
  const confirmDelete = (id) => {
    axios
      .delete(`${API}/contacts/deleteContact/${id}`)
      .then(() => setContacts((prev) => prev.filter((c) => c._id !== id)))
      .catch((err) => alert(err.response?.data?.message || err.message))
      .finally(() => setConfirmId(null));
  };

  /* ====== RENDER ====== */
  if (loading) return <p className="text-center">Loading…</p>;
  if (error)   return <p className="text-center text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-slate-400 p-6">
      {/* ===== HEADER ROW ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
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

      {/* ===== SEARCH BAR ===== */}
      <div className="max-w-md mx-auto mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search contacts…"
          className="w-full rounded-md border-2 border-blue-900 focus:border-blue-700
                     focus:ring-blue-700 text-lg px-4 py-3"
        />
      </div>

      {/* ===== ADD FORM ===== */}
      {isAdding && (
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-md p-6 mb-6 space-y-6">
          {[
            { lbl: "Full Name",     name: "fullName",    placeholder: "Michael Cohen" },
            { lbl: "Phone Number",  name: "phoneNumber", placeholder: "050-1234567" },
            { lbl: "Relationship",  name: "relationship",placeholder: "Son / Friend…" },
          ].map((f) => (
            <div key={f.name}>
              <label className="block text-lg font-semibold text-gray-700">
                {f.lbl}
              </label>
              <input
                name={f.name}
                value={form[f.name]}
                onChange={handleChange}
                placeholder={f.placeholder}
                className="mt-2 w-full rounded-md border-2 border-blue-900
                           focus:border-blue-700 focus:ring-blue-700
                           text-lg px-4 py-3"
              />
            </div>
          ))}

          <div className="flex justify-end gap-4">
            <button
              onClick={cancelAdd}
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

      {/* ===== CONTACT LIST ===== */}
      <div className="grid gap-6 max-w-md mx-auto">
        {visibleContacts.map((c) => (
          <div
            key={c._id}
            className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4"
          >
            <div className="text-xl font-medium text-gray-900">
              {c.fullName} ({c.relationship})
            </div>

            {/* ACTION BUTTONS */}
            {confirmId === c._id ? (
              /* ----- Confirmation Row ----- */
              <div className="flex flex-col gap-3">
                <span className="text-gray-800">
                  Delete&nbsp;<b>{c.fullName}</b>?
                </span>
                <div className="flex gap-4">
                  <button
                    onClick={() => confirmDelete(c._id)}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg text-lg"
                  >
                    Yes, delete
                  </button>
                  <button
                    onClick={cancelDelete}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 py-2 rounded-lg text-lg"
                  >
                    No, keep
                  </button>
                </div>
              </div>
            ) : (
              /* ----- Normal Row ----- */
              <div className="flex gap-4">
                <button
                  onClick={() => askDelete(c._id)}
                  className="flex-1 text-lg font-semibold text-white
                             bg-red-600 hover:bg-red-500
                             border-2 border-red-700 rounded-xl py-2 transition"
                >
                  Delete
                </button>
                <a
                  href={`tel:${c.phoneNumber}`}
                  className="flex-1 text-lg font-semibold text-white
                             bg-blue-900 hover:bg-blue-700
                             border-2 border-blue-950 rounded-xl py-2 transition
                             text-center"
                >
                  Call
                </a>
              </div>
            )}
          </div>
        ))}

        {/* If theres no maching contact*/}
        {visibleContacts.length === 0 && (
          <p className="text-center text-gray-700">
            No contacts match your search.
          </p>
        )}
      </div>
    </div>
  );
}
