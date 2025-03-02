import React from "react";
import { MapPin, Bell, Users } from "lucide-react";

const Nav: React.FC = () => {
  return (
    <div className="flex justify-around items-center py-3 bg-white">
      <button className="flex flex-col items-center">
        <a href="/trip-info" className="text-xs flex flex-col items-center">
          <div className="w-8 h-8 flex items-center justify-center">
            <MapPin className="h-6 w-6 text-pink-500" />
          </div>
          <span className="text-xs">Trip Status</span>
        </a>
      </button>
      <button className="flex flex-col items-center">
        <div className="w-8 h-8 flex items-center justify-center">
          <Bell className="h-6 w-6" />
        </div>
        <span className="text-xs">Alert</span>
      </button>
      <button className="flex flex-col items-center">
        <div className="w-8 h-8 flex items-center justify-center">
          <Users className="h-6 w-6" />
        </div>
        <span className="text-xs">My Contact</span>
      </button>
    </div>
  );
};

export default Nav;
