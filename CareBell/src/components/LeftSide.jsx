import React from "react";
import Bella from "./Bella";

export default function LeftSide() {
  return (
    <div
      id="leftSide"
      className="h-fit w-full md:w-2/5 flex flex-col items-center"
    >
      <Bella/>
    </div>
  );
}