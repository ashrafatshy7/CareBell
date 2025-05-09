// src/components/Header.jsx
import React, { useEffect, useState } from "react";
import logo from "../resources/Logo_Gold_Blau_Rubik.png";

const OPENWEATHER_KEY = "6d3ad80f32ae07a071aeb542a0049d46";
const WEATHER_API     = "https://api.openweathermap.org/data/2.5/weather";

export default function Header() {
  /* ---- Date & Time ---- */
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");

  /* ---- Weather ---- */
  const [temp,  setTemp]  = useState(null);   // °C
  const [icon,  setIcon]  = useState(null);   // "01d"…
  const [wErr,  setWErr]  = useState(null);

  /* === clock === */
  useEffect(() => {
    const upd = () => {
      const now = new Date();
      setDateStr(now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }));
      setTimeStr(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }));
    };
    upd();
    const id = setInterval(upd, 60_000);
    return () => clearInterval(id);
  }, []);

  /* === weather === */
  useEffect(() => {
    if (!navigator.geolocation) {
      setWErr("Geo unavailable");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const url = `${WEATHER_API}?lat=${coords.latitude}&lon=${coords.longitude}&units=metric&appid=${OPENWEATHER_KEY}`;
        fetch(url)
          .then(r => r.json())
          .then(data => {
            if (data.cod !== 200) throw new Error(data.message);
            setTemp(Math.round(data.main.temp));
            setIcon(data.weather[0].icon);
          })
          .catch(err => setWErr(err.message));
      },
      err => setWErr(err.message),
      { timeout: 5000 }
    );
  }, []);

  return (
    <header className="flex justify-between items-center py-4 px-2 border-b border-blue-800">
      {/* date / time / weather */}
      <div className="flex items-center space-x-6">
        <div className="flex flex-col leading-none">
          <span className="text-2xl font-bold">{dateStr}</span>
          <span className="text-2xl font-bold">{timeStr}</span>
        </div>

        {/* weather */}
        {icon && temp !== null ? (
          <div className="flex items-center space-x-2">
            <img
              src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
              alt="Weather icon"
              className="h-10 w-10"
            />
            <span className="text-2xl font-bold">{temp}°C</span>
          </div>
        ) : (
          wErr && <span className="text-sm text-red-600">{wErr}</span>
        )}
      </div>

      {/* logo */}
      <img src={logo} alt="CareBells Logo" className="h-16" />

      {/* buttons (settings + emergency) */}
      <div className="flex items-center space-x-4">
        <button className="flex-shrink-0 bg-gray-200 p-3 rounded-full font-bold">
          <i className="fas fa-cog"></i> Settings
        </button>
        <button className="flex-shrink-0 bg-red-500 text-white font-bold py-3 px-6 rounded-xl">
          Emergency
        </button>
      </div>
    </header>
  );
}
