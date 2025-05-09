// src/components/RightSide.jsx
import React from "react";
import {
  FaPhone,
  FaUsers,
  FaPills,
  FaUtensils,
  FaNewspaper,
  FaDumbbell,
  FaArrowLeft
} from "react-icons/fa";
import { Routes, Route, Link, useNavigate } from "react-router-dom";

import CallContacts  from "./CallContacts";
import MeetWithFriends    from "./MeetWithFriends";
import Medication    from "./Medication";
import Meals         from "./Meals";
import News          from "./News";
import Exercise      from "./Exercise";

// הגדרת רשימת הכפתורים + הנתיב אליו ננווט
const MENU_BUTTONS = [
  { label: "Call Contacts",    icon: FaPhone,    to: "call-contacts" },
  { label: "Meet With Friends", icon: FaUsers,    to: "meet-with-friends"  },
  { label: "Medicine",         icon: FaPills,    to: "medicine"     },
  { label: "Meals",            icon: FaUtensils, to: "meals"        },
  { label: "News",             icon: FaNewspaper,to: "news"         },
  { label: "Exercise",         icon: FaDumbbell, to: "exercise"     },
];

export default function RightSide() {
  const navigate = useNavigate();

  // קומפוננטה קטנה להצגת הלחצן חזרה + התוכן
  function PageWrapper({ children, title }) {
    return (
      <div className="space-y-4">
       <button
         onClick={() => navigate(-1)}
         className="
           inline-flex items-center justify-center
           border-2 border-blue-900
           rounded-xl
           py-2 px-4
           bg-white
           text-blue-900 font-semibold
           hover:bg-blue-50
           focus:outline-none focus:ring-2 focus:ring-blue-400
           transition
         "
       >
        <FaArrowLeft className="mr-2 text-xl" />
         Back
       </button>
        <h2 className="text-2xl font-bold">{title}</h2>
        <div>{children}</div>
      </div>
    );
  }

  return (
    <div id="rightSide" className="w-3/5 mt-20">
      <Routes>
        {/* Route ראשי: התפריט */}
        <Route
          index
          element={
            <div className="grid grid-cols-2 gap-6">
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

        {/* לכל כפתור – route משלו */}
        <Route
          path="call-contacts"
          element={
            <PageWrapper title="Call Contacts">
              <CallContacts />
            </PageWrapper>
          }
        />
        <Route
          path="meet-with-friends"
          element={
            <PageWrapper title="Meet with Friends">
              <MeetWithFriends />
            </PageWrapper>
          }
        />
        <Route
          path="medicine"
          element={
            <PageWrapper title="Medicine">
              <Medication />
            </PageWrapper>
          }
        />
        <Route
          path="meals"
          element={
            <PageWrapper title="Meals">
              <Meals />
            </PageWrapper>
          }
        />
        <Route
          path="news"
          element={
            <PageWrapper title="News">
              <News />
            </PageWrapper>
          }
        />
        <Route
          path="exercise"
          element={
            <PageWrapper title="Exercise">
              <Exercise />
            </PageWrapper>
          }
        />
      </Routes>
    </div>
  );
}
