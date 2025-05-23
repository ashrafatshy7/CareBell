import React, { useEffect, useState, useMemo, useContext } from "react";
import axios from "axios";
import { AppContext } from "../AppContext";
import { API } from "../config";

export default function CallContacts() {
  const { user } = useContext(AppContext);
  const userId = user?.id;

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ fullName: "", phoneNumber: "", relationship: "" });
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API}/contacts/getAll/${userId}`)
      .then(res => setContacts(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  const visibleContacts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts
      .filter(c =>
        c.fullName.toLowerCase().includes(q) ||
        c.phoneNumber.includes(q) ||
        c.relationship?.toLowerCase().includes(q)
      )
      .sort((a, b) => a.fullName.localeCompare(b.fullName, undefined, { sensitivity: "base" }));
  }, [contacts, query]);

  const toggleSelect = id => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setMenuOpen(false);
    if (!window.confirm(`Delete ${selectedIds.size} contact(s)?`)) return;
    Promise.all(
      Array.from(selectedIds).map(id => axios.delete(`${API}/contacts/deleteContact/${id}`))
    )
      .then(() => {
        setContacts(prev => prev.filter(c => !selectedIds.has(c._id)));
        setSelectedIds(new Set());
      })
      .catch(err => alert(err.response?.data?.message || err.message));
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSave = () => {
    if (!form.fullName || !form.phoneNumber) {
      alert("Please fill all fields");
      return;
    }
    setSaving(true);
    axios
      .post(`${API}/contacts/addContact`, { userId, ...form })
      .then(res => {
        setContacts(prev => [...prev, res.data]);
        setIsAdding(false);
        setForm({ fullName: "", phoneNumber: "", relationship: "" });
      })
      .catch(err => alert(err.response?.data?.message || err.message))
      .finally(() => setSaving(false));
  };

  if (loading) return <p className="text-center py-8">Loading…</p>;
  if (error) return <p className="text-center text-red-600 py-8">{error}</p>;

  return (
    <div className="h-full flex flex-col bg-slate-400 p-4 overflow-y-auto">
      {/* Header: Search, Add, and Bulk Menu */}
      <div className="flex items-center mb-6 max-w-md mx-auto">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search contacts…"
          className="flex-1 rounded-md border-2 border-blue-900 focus:border-blue-700 focus:ring-blue-700 text-base px-4 py-2"
        />
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="ml-3 bg-blue-900 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg px-4 py-2 transition"
          >
            Add Contact
          </button>
        )}
        {/* Bulk menu trigger */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="ml-auto ml-4  text-blue-900 p-5 font-semibold focus:outline-none"
        >
          <span className="text-xl">🗑️</span>
        </button>
        {menuOpen && (
          <div className=" absolute mt-20 right-96 transform translate-x-4/5 bg-white border border-gray-200 rounded-md shadow-lg z-10">
            <ul className="py-1">
              <li>
                <button
                  onClick={handleBulkDelete}
                  disabled={selectedIds.size === 0}
                  className=" text-left px-4 py-2 text-sm text-gray-900 font-semibold hover:bg-red-300 "
                >
                  Delete Selected
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Add form */}
      {isAdding && (
        <div className="mb-6 max-w-md mx-auto bg-white rounded-2xl shadow-md p-3 space-y-1">
          {[{ lbl: "Full Name", name: "fullName", placeholder: "Michael Cohen" },
            { lbl: "Phone Number", name: "phoneNumber", placeholder: "050-1234567" },
            { lbl: "Relationship", name: "relationship", placeholder: "Son / Friend…" }].map(f => (
            <div key={f.name}>
              <label className="block text-base font-semibold text-gray-700">{f.lbl}</label>
              <input
                name={f.name}
                value={form[f.name]}
                onChange={handleChange}
                placeholder={f.placeholder}
                className="mt-1 w-full rounded-md border-2 border-blue-900 focus:border-blue-700 focus:ring-blue-700 text-base px-3 py-2"
              />
            </div>
          ))}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => { setIsAdding(false); setForm({ fullName: "", phoneNumber: "", relationship: "" }); }}
              className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-sm transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-blue-900 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-60 transition"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* Contacts list with selection */}
      <div className="grid gap-6 max-w-md mx-auto">
        {visibleContacts.map(c => (
          <label
            key={c._id}
            className="relative bg-white rounded-3xl shadow-md p-6 flex items-center gap-3"
          >
            {menuOpen && (
              <input
                type="checkbox"
                checked={selectedIds.has(c._id)}
                onChange={() => toggleSelect(c._id)}
                className="h-5 w-5"
              />
            )}
            <div className={`${menuOpen ? 'ml-2 flex-1' : 'flex-1'}`}>              
              <div className="text-lg font-medium text-gray-900">
                {c.fullName} {c.relationship && `(${c.relationship})`}
              </div>
              <a
                href={`tel:${c.phoneNumber}`}
                className="mt-2 inline-block text-sm font-semibold text-white bg-blue-900 hover:bg-blue-700 rounded-lg py-2 px-4 transition"
              >
                Call
              </a>
            </div>
          </label>
        ))}

        {visibleContacts.length === 0 && (
          <p className="text-center text-gray-700">No contacts match your search.</p>
        )}
      </div>
    </div>
  );
}
