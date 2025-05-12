import React, { useContext } from "react";
import {
  FaPhone,
  FaUsers,
  FaPills,
  FaUtensils,
  FaNewspaper,
  FaDumbbell,
  FaArrowLeft
} from "react-icons/fa";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
  Outlet
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
    <div className="flex flex-col h-full min-h-0 bg-slate-400 p-4">
      {/* Toolbar */}
      <div className="flex items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-blue-900 rounded-lg text-blue-900 font-semibold hover:bg-blue-50 transition"
        >
          <FaArrowLeft /> Back
        </button>
        <h2 className="ml-4 text-2xl font-bold text-gray-800 whitespace-nowrap">
          {title}
        </h2>
      </div>

      {/* Scrollable content that fills full width */}
      <div className="flex-1 overflow-y-auto min-w-0">
        <div className="w-full p-2">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default function RightSide() {
  const { user } = useContext(AppContext);
  const heightClass = "h-[75vh]";   // Height of panel
  const widthClass  = "w-[48vw]";   // Width of panel, adjust as needed

  if (!user) {
    return (
      <div className={`${widthClass} ${heightClass} px-4 flex items-center justify-center`}>
        <p className="text-xl">Loading user…</p>
      </div>
    );
  }

  return (
    <div
      id="rightSide"
      className={`${widthClass} ${heightClass} px-4 overflow-hidden`}
    >
      <Routes>
        {/* Main menu */}
        <Route
          index
          element={
            <div className="grid grid-cols-2 gap-6 p-6">
              {MENU_BUTTONS.map(({ label, icon: Icon, to }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex flex-col items-center justify-center border-2 border-blue-900 rounded-xl p-6 hover:bg-blue-100 transition whitespace-nowrap"
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

        {/* Sub-pages */}
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