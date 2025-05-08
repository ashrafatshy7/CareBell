import React, { useState, useEffect } from "react";
import logo from "../resources/Logo_Gold_Blau_Rubik.png";

export default function Header() {
  // local state for date & time strings
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const dateOpts = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const timeOpts = { hour: "2-digit", minute: "2-digit", hour12: false };

    function updateDateTime() {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString("en-US", dateOpts));
      setCurrentTime(now.toLocaleTimeString("en-US", timeOpts));
    }

    // run once immediately, then every second
    updateDateTime();
    const intervalId = setInterval(updateDateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <header className="flex justify-between items-center py-4 px-2 border-b border-blue-800">
      {/* React-driven date/time */}
      <div className="flex items-baseline space-x-4">
        <div className="text-2xl font-bold">{currentDate}</div>
        <div className="text-2xl font-bold">{currentTime}</div>
      </div>

      {/* Logo */}
      <div>
        <img src={logo} className="h-18 w-48" alt="CareBell Logo" />
      </div>

      {/* Buttons */}
      <div className="flex flex-nowrap items-center space-x-4">
        <button
          id="settingsBtn"
          className="flex-shrink-0 bg-gray-200 p-3 rounded-full font-bold"
        >
          <i className="fas fa-cog"></i> Settings
        </button>
        <button
          id="emergencyBtn"
          className="flex-shrink-0 bg-red-500 text-white font-bold py-3 px-6 rounded-xl"
        >
          Emergency
        </button>
      </div>
    </header>
  );
}