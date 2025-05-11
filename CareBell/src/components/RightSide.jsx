// src/components/RightSide.jsx
import React, { useContext } from "react";
import {
  FaPhone,
  FaUsers,
  FaPills,
  FaUtensils,
  FaNewspaper,
  FaDumbbell,
  FaArrowLeft,
} from "react-icons/fa";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
  Outlet,
} from "react-router-dom";

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

// Map path segments to titles
const TITLES = {
  "call-contacts":     "Call Contacts",
  "meet-with-friends": "Meet With Friends",
  medicine:             "Medicine",
  meals:                "Meals",
  news:                 "News",
  exercise:             "Exercise",
};

function PanelLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const segment = pathname.split("/").pop();
  const title = TITLES[segment] || "";

  return (
    <div className="h-full flex flex-col bg-slate-400 p-2 overflow-y-auto">
      <div className="relative flex items-center mb-4">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center border-2 border-blue-900 rounded-lg px-3 py-2 bg-white text-blue-900 font-semibold text-sm hover:bg-blue-50 focus:ring-2 focus:ring-blue-400 transition"
        >
          <FaArrowLeft className="mr-1 text-lg" /> Back
        </button>

        {/* Centered title */}
        <h2 className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-gray-800">
          {title}
        </h2>

        {/* Placeholder for right slot */}
        <div className="absolute right-0 px-3 py-2">
          <div className="invisible">spacer</div>
        </div>
      </div>

      {/* Render the matched panel */}
      <Outlet />
    </div>
  );
}

export default function RightSide() {
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
                  className="flex flex-col items-center justify-center border-2 border-blue-900 rounded-xl p-6 hover:bg-blue-100 transition"
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

        {/* Nested routes under the shared PanelLayout */}
        <Route element={<PanelLayout />}>  
          <Route path="call-contacts"     element={<CallContacts />} />
          <Route path="meet-with-friends" element={<MeetWithFriends />} />
          <Route path="medicine"          element={<Medication />} />
          <Route path="meals"             element={<Meals />} />
          <Route path="news"              element={<News />} />
          <Route path="exercise"          element={<Exercise />} />
        </Route>
      </Routes>
    </div>
  );
}
