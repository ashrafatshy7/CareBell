//./src/components/CallContacts.jsx
import React, { useEffect, useState, useMemo, useContext } from "react";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../AppContext";
import { API } from "../config";
export default function CallContacts() {
  /* ====== CONFIG ====== */
  const { user } = useContext(AppContext);
  const userId = user?.id;
  const navigate = useNavigate();
  
    /* STATE */
    const [contacts,  setContacts]  = useState([]);
    const [loading,   setLoading ]  = useState(true);
    const [error,     setError   ]  = useState(null);
    const [isAdding,  setIsAdding]  = useState(false);
    const [saving,    setSaving ]   = useState(false);
    const [form,      setForm   ]   = useState({ fullName: "", phoneNumber: "", relationship: "" });
    const [confirmId, setConfirmId] = useState(null);
    const [query,     setQuery    ] = useState("");
  
    /* FETCH */
    useEffect(() => {
      axios
        .get(`${API}/contacts/getAll/${userId}`)
        .then((res) => setContacts(res.data))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, [userId]);
  
    /* FILTER + SORT */
    const visibleContacts = useMemo(() => {
      const q = query.trim().toLowerCase();
      return contacts
        .filter((c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.phoneNumber.includes(q) ||
          c.relationship?.toLowerCase().includes(q)
        )
        .sort((a, b) =>
          a.fullName.localeCompare(b.fullName, undefined, { sensitivity: "base" })
        );
    }, [contacts, query]);
  
    /* HANDLERS */
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
  
    const askDelete    = (id) => setConfirmId(id);
    const cancelDelete = ()   => setConfirmId(null);
  
    const confirmDelete = (id) => {
      axios
        .delete(`${API}/contacts/deleteContact/${id}`)
        .then(() =>
          setContacts((prev) => prev.filter((c) => c._id !== id))
        )
        .catch((err) => alert(err.response?.data?.message || err.message))
        .finally(() => setConfirmId(null));
    };
  
    if (loading) return <p className="text-center">Loading…</p>;
    if (error)   return <p className="text-center text-red-600">{error}</p>;
  
    return (
      <div className="h-full flex flex-col bg-slate-400 p-2 overflow-y-auto">
        {/* HEADER */}
        <div className="relative flex items-center mb-4">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center border-2 border-blue-900 rounded-lg px-3 py-2 bg-white text-blue-900 font-semibold text-sm hover:bg-blue-50 focus:ring-2 focus:ring-blue-400 transition"
          >
            <FaArrowLeft className="mr-1 text-lg" />
            Back
          </button>
  
          {/* Centered title */}
          <h2 className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-gray-800">
            Call Contacts
          </h2>
  
          {/* Right slot: real button or placeholder */}
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="absolute -right-0 flex items-center bg-blue-900 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg px-3 py-2 transition"
            >
              Add Contact
            </button>
          ) : (
            <div className="px-3 py-2 rounded-lg invisible" />
          )}
        </div>
  
        {/* SEARCH */}
        <div className="mb-4 max-w-md mx-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contacts…"
            className="w-full rounded-md border-2 border-blue-900 focus:border-blue-700 focus:ring-blue-700 text-base px-4 py-2"
          />
        </div>
  
        {/* ADD FORM */}
        {isAdding && (
          <div className="mb-6 max-w-md mx-auto bg-white rounded-2xl shadow-md p-6 space-y-4">
            {[
              { lbl: "Full Name",    name: "fullName",    placeholder: "Michael Cohen" },
              { lbl: "Phone Number", name: "phoneNumber", placeholder: "050-1234567" },
              { lbl: "Relationship", name: "relationship", placeholder: "Son / Friend…" },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-base font-semibold text-gray-700">
                  {f.lbl}
                </label>
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
                onClick={cancelAdd}
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
  
        {/* CONTACTS LIST */}
        <div className="grid gap-4 max-w-md mx-auto">
          {visibleContacts.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-2xl shadow-md p-4 flex flex-col gap-3"
            >
              <div className="text-lg font-medium text-gray-900">
                {c.fullName} ({c.relationship})
              </div>
  
              {confirmId === c._id ? (
                <div className="flex flex-col gap-2">
                  <span className="text-gray-800">
                    Delete <b>{c.fullName}</b>?
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => confirmDelete(c._id)}
                      className="flex-1 bg-red-600 hover:bg-red-500 text-white py-1 rounded-lg text-sm"
                    >
                      Yes
                    </button>
                    <button
                      onClick={cancelDelete}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 py-1 rounded-lg text-sm"
                    >
                      No
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <a
                    href={`tel:${c.phoneNumber}`}
                    className="flex-1 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-700 rounded-lg py-2 text-center"
                  >
                    Call
                  </a>
                  <button
                    onClick={() => askDelete(c._id)}
                    className="bg-gray-300 px-3 py-1 text-sm font-semibold text-gray-900 border border-gray-900 rounded-lg hover:bg-red-100 transition"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
  
          {visibleContacts.length === 0 && (
            <p className="text-center text-gray-700">
              No contacts match your search.
            </p>
          )}
        </div>
      </div>
    );
  }
  