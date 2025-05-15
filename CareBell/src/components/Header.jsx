import React, { useEffect, useState } from "react";
import logo from "../resources/Logo_Gold_Blau_Rubik.png";
import { Link } from "react-router-dom";
import SettingsModal from "./SettingsModal";

const OPENWEATHER_KEY = "6d3ad80f32ae07a071aeb542a0049d46";
const WEATHER_API = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_API = "https://api.openweathermap.org/data/2.5/forecast";

export default function Header() {
  /* ---- Date / Time ---- */
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");

  /* ---- Weather (current) ---- */
  const [temp, setTemp] = useState(null);
  const [icon, setIcon] = useState(null);
  const [wErr, setWErr] = useState(null);

  /* ---- Settings modal ---- */
  const [showSettings, setShowSettings] = useState(false);

  /* ---- Calendar ---- */
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setDateStr(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })
      );
      setTimeStr(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setWErr("Geo unavailable");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const url = `${WEATHER_API}?lat=${coords.latitude}&lon=${coords.longitude}&units=metric&appid=${OPENWEATHER_KEY}`;
        fetch(url)
          .then((r) => r.json())
          .then((data) => {
            if (data.cod !== 200) throw new Error(data.message);
            setTemp(Math.round(data.main.temp));
            setIcon(data.weather[0].icon);
          })
          .catch((err) => setWErr(err.message));
      },
      (err) => setWErr(err.message),
      { timeout: 5000 }
    );
  }, []);

  return (
    <>
      <header className="flex justify-between items-center py-4 px-4 border-b border-blue-900 mb-4 bg-slate-200 relative">
        {/* date / time / weather */}
        <div className="flex items-center space-x-6 text-blue-900">
          <div className="flex flex-col leading-none">
            <span className="text-lg font-bold">{dateStr}</span>
            <span className="text-xl font-bold">{timeStr}</span>
          </div>

          {icon && temp !== null ? (
            <div className="flex items-center space-x-2">
              <img
                src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
                alt="Weather"
                className="h-10 w-10"
              />
              <span className="text-2xl font-bold">{temp}°C</span>
            </div>
          ) : (
            wErr && <span className="text-sm text-red-600">{wErr}</span>
          )}
        </div>

        {/* logo */}
        <Link to="/">
          <img
            src={logo}
            alt="CareBells Logo"
            className="h-16 cursor-pointer"
          />
        </Link>

        {/* buttons */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCalendarOpen((o) => !o)}
            className="flex-shrink-0 bg-blue-900 text-yellow-200 p-3 rounded-full font-bold hover:bg-blue-800"
          >
            <span className="text-xl">📅</span>
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="flex-shrink-0 bg-blue-900 text-yellow-200 p-3 rounded-full font-bold hover:bg-blue-800"
          >
            <span className="text-xl">⚙️</span>
          </button>
          <button className="flex-shrink-0 bg-red-500 text-white font-bold py-3 px-6 rounded-xl">
            Emergency
          </button>
        </div>
      </header>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {calendarOpen && <Calendar onClose={() => setCalendarOpen(false)} />}
    </>
  );
}

// ================= Calendar Component =================
function Calendar({ onClose }) {
  const [events, setEvents] = useState([]);
  const [forecast, setForecast] = useState({});

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("calendarEvents") || "[]");
    setEvents(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("calendarEvents", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.latitude}&lon=${coords.longitude}&units=metric&appid=${OPENWEATHER_KEY}`
      )
        .then((r) => r.json())
        .then((data) => {
          const daily = {};
          data.list.forEach((item) => {
            const day = new Date(item.dt_txt).toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' });
            if (!daily[day]) daily[day] = Math.round(item.main.temp);
          });
          setForecast(daily);
        });
    });
  }, []);

  const startOfWeek = (offset) => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + offset * 7;
    return new Date(now.setDate(diff));
  };

  const weeks = [0, 1, 2].map((i) => {
    const start = startOfWeek(i);
    return Array.from({ length: 7 }).map((_, j) => {
      const d = new Date(start);
      d.setDate(start.getDate() + j);
      return d;
    });
  });

  const addEvent = (date) => {
    const text = prompt(`New event for ${date.toDateString()}`);
    if (text) setEvents((e) => [...e, { date: date.toDateString(), text }]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start p-6 overflow-auto">
      <div className="bg-blue-100 rounded-2xl shadow-lg p-6 max-w-3xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-900">Calendar</h2>
          <button onClick={onClose} className="text-blue-900 text-xl">✖️</button>
        </div>
        <div className="space-y-8">
          {weeks.map((week, idx) => (
            <div key={idx} className="bg-blue-200 rounded-lg p-4">
              <h3 className="text-xl font-semibold text-blue-900 mb-3">Week {idx + 1}</h3>
              <div className="grid grid-cols-7 gap-3">
                {week.map((day) => {
                  const dayStr = day.toDateString();
                  const dayShort = day.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });
                  const temp = forecast[day.toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' })];
                  return (
                    <div key={dayStr} className="border-2 border-blue-900 rounded-lg p-3 flex flex-col justify-between bg-white">
                      <div>
                        <div className="font-medium text-blue-900">{dayShort}</div>
                        {temp !== undefined && (
                          <div className="text-sm text-gray-700 mt-1">{temp}°C</div>
                        )}
                      </div>
                      <div className="flex-1 overflow-y-auto mt-2 text-sm text-gray-800">
                        {events.filter((ev) => ev.date === dayStr).map((ev, i) => (
                          <div key={i} className="mb-1">• {ev.text}</div>
                        ))}
                      </div>
                      <button
                        onClick={() => addEvent(day)}
                        className="mt-3 px-3 py-1 bg-blue-900 text-yellow-200 rounded-md text-sm font-semibold hover:bg-blue-800 transition"
                      >
                        Add Event
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
