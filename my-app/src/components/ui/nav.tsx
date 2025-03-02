"use client";

import React, { useState } from "react";
import { MapPin, Bell, Users } from "lucide-react";

const Nav: React.FC = () => {
  // Initially, no icon is active
  const [activeIcons, setActiveIcons] = useState({
    trip: false,
    alert: false,
    contact: false,
  });

  const handleClick = (icon: "trip" | "alert" | "contact") => {
    setActiveIcons({
      trip: icon === "trip",
      alert: icon === "alert",
      contact: icon === "contact",
    });
  };

  return (
    <div className="flex justify-around items-center py-3 bg-white">
      <button
        onClick={() => handleClick("trip")}
        className="flex flex-col items-center"
      >
        <a href="/" className="text-xs flex flex-col items-center">
          <div className="w-8 h-8 flex items-center justify-center">
            <MapPin
              className={`h-6 w-6 ${
                activeIcons.trip ? "text-pink-500" : "text-gray-500"
              }`}
            />
          </div>
          <span
            className={`text-xs ${
              activeIcons.trip ? "text-pink-500" : "text-gray-500"
            }`}
          >
            Start Trip
          </span>
        </a>
      </button>
      <button
        onClick={() => handleClick("alert")}
        className="flex flex-col items-center"
      >
        <a href="/arrived" className="text-xs flex flex-col items-center">
          <div className="w-8 h-8 flex items-center justify-center">
            <Bell
              className={`h-6 w-6 ${
                activeIcons.alert ? "text-pink-500" : "text-gray-500"
              }`}
            />
          </div>
          <span
            className={`text-xs ${
              activeIcons.alert ? "text-pink-500" : "text-gray-500"
            }`}
          >
            Trip Status
          </span>
        </a>
      </button>
      <button
        onClick={() => handleClick("contact")}
        className="flex flex-col items-center"
      >
        <a href="/trip-info" className="text-xs flex flex-col items-center">
          <div className="w-8 h-8 flex items-center justify-center">
            <Users
              className={`h-6 w-6 ${
                activeIcons.contact ? "text-pink-500" : "text-gray-500"
              }`}
            />
          </div>
          <span
            className={`text-xs ${
              activeIcons.contact ? "text-pink-500" : "text-gray-500"
            }`}
          >
            My Contact
          </span>
        </a>
      </button>
    </div>
  );
};

export default Nav;
