import React, { useEffect, useState } from "react";
import { FaVolumeMute, FaVolumeUp, FaRunning, FaTachometerAlt } from "react-icons/fa";

export default function SettingsModal({ onClose }) {
  /* ------------- text size (scale) ------------- */
  const [scale, setScale] = useState(
    parseFloat(localStorage.getItem("fontScale")) || 1
  );

  useEffect(() => {
    document.documentElement.style.fontSize = `${16 * scale}px`;
    localStorage.setItem("fontScale", scale);
  }, [scale]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      {/* panel */}
      <div className="w-[95%] max-w-md bg-white rounded-3xl shadow-xl p-8 relative">
        {/* close X */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-2xl text-gray-600 hover:text-gray-800"
        >
          ×
        </button>

        <h2 className="text-3xl font-bold text-blue-800 mb-8">Settings</h2>

        {/* -------- TEXT SIZE -------- */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-3">Text Size</h3>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold">A</span>
            <input
              type="range"
              min={0.8}
              max={1.6}
              step={0.05}
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="flex-1 accent-blue-600 h-2 rounded-lg bg-gray-300"
            />
            <span className="text-5xl font-bold">A</span>
          </div>
        </section>

        {/* -------- Volume (UI-only) -------- */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-3">Volume</h3>
          <div className="flex items-center gap-4">
            <FaVolumeMute className="text-2xl" />
            <input
              type="range"
              min={0}
              max={100}
              defaultValue={70}
              className="flex-1 accent-blue-600 h-2 rounded-lg bg-gray-300"
              disabled      /* only for UI. in the future it will be implemented*/
            />
            <FaVolumeUp className="text-2xl" />
          </div>
        </section>

        {/* -------- Speaking Speed (UI-only) -------- */}
        <section>
          <h3 className="text-xl font-semibold mb-3">Speaking Speed</h3>
          <div className="flex items-center gap-4">
            <FaTachometerAlt className="text-2xl" />
            <input
              type="range"
              min={0.5}
              max={1.5}
              step={0.1}
              defaultValue={1}
              className="flex-1 accent-blue-600 h-2 rounded-lg bg-gray-300"
              disabled      /* for the future */
            />
            <FaRunning className="text-2xl" />
          </div>
        </section>
      </div>
    </div>
  );
}
