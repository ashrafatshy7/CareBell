// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header        from "./components/Header";
import LeftSide      from "./components/LeftSide";
import RightSide     from "./components/RightSide";

export default function App() {
  return (
    <BrowserRouter>
      <div
        className="w-full max-w-screen-lg mx-auto p-4 min-h-screen flex flex-col"
        style={{ fontSize: "var(--font-size-base,22px)" }}
      >
        <Header />

        <div id="mainContent" className="flex-1 flex flex-col md:flex-row gap-8">
          <LeftSide />

          {/* זה המקום שבו הכפתורים נשארים */}
          <RightSide />
        </div>
      </div>
    </BrowserRouter>
);
}
