// src/components/RightSide.jsx
import React, { useContext } from "react";
import {
  FaPhone,
  FaUsers,
  FaPills,
  FaUtensils,
  FaNewspaper,
  FaDumbbell,
} from "react-icons/fa";
import { Routes, Route, Link } from "react-router-dom";

import { AppContext } from "../AppContext";
import CallContacts      from "./CallContacts";
import MeetWithFriends   from "./MeetWithFriends";
import Medication        from "./Medication";
import Meals             from "./Meals";
import News              from "./News";
import Exercise          from "./Exercise";

const MENU_BUTTONS = [
  { label: "Call Contacts",     icon: FaPhone,     to: "call-contacts"     },
  { label: "Meet With Friends", icon: FaUsers,     to: "meet-with-friends" },
  { label: "Medicine",          icon: FaPills,     to: "medicine"          },
  { label: "Meals",             icon: FaUtensils,  to: "meals"             },
  { label: "News",              icon: FaNewspaper, to: "news"              },
  { label: "Exercise",          icon: FaDumbbell,  to: "exercise"          },
];

export default function RightSide() {
  // Pull `user` from context and guard until it’s ready
  const { user } = useContext(AppContext);
  if (!user) {
    return (
      <div className="w-3/5 h-screen flex items-center justify-center">
        <p className="text-xl">Loading user…</p>
      </div>
    );
  }

  return (
    <div id="rightSide" className="w-3/5 h-screen overflow-hidden">
      <Routes>
        {/* Index: show menu grid */}
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
                    border-2 border-blue-900 rounded-xl p-6
                    hover:bg-blue-100 transition
                  "
                >
                  <Icon className="text-4xl mb-2 text-blue-900" />
                  <span className="text-lg font-semibold text-blue-900">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          }
        />

        {/* Protected sub-routes now safe to render */}
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
