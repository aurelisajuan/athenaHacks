"use client";

import React, { useState } from "react";
import { MapPin, Bell, Users } from "lucide-react";

const Nav: React.FC = () => {
  const [active, setActive] = useState<string>("trip");

  return (
    <div className="flex justify-around items-center py-3 bg-white">
      <button
        onClick={() => setActive("trip")}
        className="flex flex-col items-center"
      >
        <a href="/trip-info" className="text-xs flex flex-col items-center">
          <div className="w-8 h-8 flex items-center justify-center">
            <MapPin
              className={`h-6 w-6 ${
                active === "trip" ? "text-pink-500" : "text-gray-500"
              }`}
            />
          </div>
          <span
            className={`text-xs ${
              active === "trip" ? "text-pink-500" : "text-gray-500"
            }`}
          >
            Trip Status
          </span>
        </a>
      </button>
      <button
        onClick={() => setActive("alert")}
        className="flex flex-col items-center"
      >
        <div className="w-8 h-8 flex items-center justify-center">
          <Bell
            className={`h-6 w-6 ${
              active === "alert" ? "text-pink-500" : "text-gray-500"
            }`}
          />
        </div>
        <span
          className={`text-xs ${
            active === "alert" ? "text-pink-500" : "text-gray-500"
          }`}
        >
          Alert
        </span>
      </button>
      <button
        onClick={() => setActive("contact")}
        className="flex flex-col items-center"
      >
        <div className="w-8 h-8 flex items-center justify-center">
          <Users
            className={`h-6 w-6 ${
              active === "contact" ? "text-pink-500" : "text-gray-500"
            }`}
          />
        </div>
        <span
          className={`text-xs ${
            active === "contact" ? "text-pink-500" : "text-gray-500"
          }`}
        >
          My Contact
        </span>
      </button>
    </div>
  );
};

export default Nav;
