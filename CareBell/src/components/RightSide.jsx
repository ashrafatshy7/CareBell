// src/RightSide.jsx
import React from "react";
import {
  FaPhone,
  FaUsers,
  FaPills,
  FaUtensils,
  FaNewspaper,
  FaDumbbell,
} from "react-icons/fa";
import { Routes, Route, Link } from "react-router-dom";

import CallContacts      from "./CallContacts";
import MeetWithFriends   from "./MeetWithFriends";
import Medication        from "./Medication";
import Meals             from "./Meals";
import News              from "./News";
import Exercise          from "./Exercise";

const MENU_BUTTONS = [
  { label: "Call Contacts",     icon: FaPhone,     to: "call-contacts"       },
  { label: "Meet With Friends", icon: FaUsers,     to: "meet-with-friends"   },
  { label: "Medicine",          icon: FaPills,     to: "medicine"            },
  { label: "Meals",             icon: FaUtensils,  to: "meals"               },
  { label: "News",              icon: FaNewspaper, to: "news"                },
  { label: "Exercise",          icon: FaDumbbell,  to: "exercise"            },
];

export default function RightSide() {
  return (
    <div
      id="rightSide"
      className="w-3/5 h-screen overflow-hidden"
    >
      <Routes>
        <Route
          index
          element={
            <div className="grid grid-cols-2 gap-6 p-6">
              {MENU_BUTTONS.map(({ label, icon: Icon, to }) => (
                <Link
                  key={to}
                  to={to}
                  className="
                    flex flex-col items-center justify-center
                    border-2 border-blue-900
                    rounded-xl
                    py-6 px-4
                    hover:bg-blue-50
                    transition
                    focus:outline-none focus:ring-2 focus:ring-blue-400
                  "
                >
                  <Icon className="text-blue-900 text-3xl mb-2" />
                  <span className="text-blue-900 font-semibold text-lg">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          }
        />

        {/* Each routed component will fill this h-screen parent */}
        <Route path="call-contacts"     element={<CallContacts />} />
        <Route path="meet-with-friends" element={<MeetWithFriends />} />
        <Route path="medicine"          element={<Medication />} />
        <Route path="meals"             element={<Meals />} />
        <Route path="news"              element={<News />} />
        <Route path="exercise"          element={<Exercise />} />
      </Routes>
    </div>
  );
}
