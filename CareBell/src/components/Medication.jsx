import React, { useState } from "react";

const Medication = () => {
  const [medications, setMedications] = useState([
    { name: "Aspirin", lastTaken: "2025-05-07 08:00", taken: false },
    { name: "Metformin", lastTaken: "2025-05-07 12:00", taken: false },
    { name: "Lisinopril", lastTaken: "2025-05-07 20:00", taken: true },
  ]);

  const handleMarkAsTaken = (index) => {
    const updated = [...medications];
    updated[index].taken = true;
    updated[index].lastTaken = new Date().toLocaleString();
    setMedications(updated);
  };

  return (
    <div className="min-h-screen bg-slate-400 p-6">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Medication</h2>
      <div className="grid gap-6 max-w-md mx-auto">
        {medications.map((med, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-2"
          >
            <div className="text-xl font-semibold text-gray-900">{med.name}</div>
            <div className="text-gray-600 text-sm">
              Last taken: {med.lastTaken}
            </div>
            <button
              onClick={() => handleMarkAsTaken(index)}
              disabled={med.taken}
              className={`mt-2 py-2 px-4 rounded-xl text-white font-semibold transition ${
                med.taken
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-900 hover:bg-blue-700"
              }`}
            >
              {med.taken ? "Already Taken" : "Mark as Taken"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Medication;
