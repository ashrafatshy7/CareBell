import React, {useEffect, useState} from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header        from "./components/Header";
import LeftSide      from "./components/LeftSide";
import RightSide     from "./components/RightSide";
import { AppContext } from "./AppContext";

export const API = "https://carebell.online";

/**
 * Fetches JSON from the given URL and throws on HTTP errors.
 * @param {string} url
 * @returns {Promise<any>}
 */
export async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return res.json();
}


export default function App() {

  const [user, setUser] = useState(null);

  useEffect(() => {
    //Set first user as default user
    async function loadInitUser(){
      try{
        var users = await fetchJson(`${API}/users/`);
        setUser(users[0]);
      }
      catch(error){
        console.error("Error fetching users:",error);
      }
    };
    loadInitUser();
  }, []);

  return (
    <AppContext.Provider value={{user, setUser}}>
    <BrowserRouter>
      <div
        className="w-full max-w-screen-lg mx-auto p-4 min-h-screen flex flex-col"
        style={{ fontSize: "var(--font-size-base,22px)" }}
      >
        <Header />

        <div id="mainContent" className="flex-1 flex flex-col md:flex-row gap-8">
          <LeftSide />

          <RightSide />
        </div>
      </div>
    </BrowserRouter>
    </AppContext.Provider>
);
}
