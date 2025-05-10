// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header    from "./components/Header";
import LeftSide  from "./components/LeftSide";
import RightSide from "./components/RightSide";

export default function App() {
  return (
    <BrowserRouter>
      <div
        className="
          w-full max-w-screen-lg mx-auto
          p-4
          h-screen          /* exactly viewport height */
          flex flex-col
        "
        style={{ fontSize: "var(--font-size-base,22px)" }}
      >
        {/* 1) Header at fixed height */}
        <Header />

        {/* 2) Main content takes remaining height, no page scroll */}
        <div
          id="mainContent"
          className="
            flex-1               /* fill remaining height */
            flex flex-col md:flex-row gap-2
            overflow-hidden      /* hide any overflow—scroll in children only */
          "
        >
          <LeftSide />

          {/* RightSide now will be h-full and scroll internally */}
          <RightSide />
        </div>
      </div>
    </BrowserRouter>
  );
}
