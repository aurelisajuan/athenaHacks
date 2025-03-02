"use client";

import type React from "react";

import { useState } from "react";
import Image from "next/image";
import { Search, MapPin, Bell, Users } from "lucide-react";

// Types for our data
type SavedLocation = {
  id: string;
  name: string;
  distance: string;
};

// Dummy data for saved locations
const savedLocations: SavedLocation[] = [
  { id: "1", name: "1225 W 30th Street", distance: "1.5mi" },
  { id: "2", name: "Century City Mall", distance: "7.2mi" },
  { id: "3", name: "Century City Mall", distance: "7.2mi" },
];

// Dummy function to handle search - would connect to backend
const searchDestination = (query: string) => {
  console.log("Searching for:", query);
  // This would typically make an API call to search for destinations
};

// Dummy function to get user's current location
const getCurrentLocation = () => {
  // This would use the browser's geolocation API in a real implementation
  return { lat: 34.0224, lng: -118.2851 }; // USC area coordinates as example
};

export default function StartTrip() {
  const [destination, setDestination] = useState("");
  const [userName, setUserName] = useState("Name"); // Would come from user profile

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchDestination(destination);
  };

  // Handle quick destination selection
  const handleQuickDestination = (place: string) => {
    console.log(`Selected ${place}`);
    // Would typically fetch the saved location and set as destination
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-1 p-6 overflow-auto">
        {/* Header with greeting and avatar */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-normal">
            Hi, <span className="font-semibold">{userName}</span>
          </h1>
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        </div>

        {/* Main heading */}
        <h2 className="text-3xl font-bold mb-4">Where to?</h2>

        {/* Search input */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter your destination"
              className="w-full py-3 px-4 bg-white rounded-full text-gray-700 focus:outline-none"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </form>

        {/* Quick destination buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => handleQuickDestination("Home")}
            className="flex-1 py-3 bg-gray-200 rounded-full text-center"
          >
            Home
          </button>
          <button
            onClick={() => handleQuickDestination("School")}
            className="flex-1 py-3 bg-gray-200 rounded-full text-center"
          >
            School
          </button>
          <button
            onClick={() => handleQuickDestination("Work")}
            className="flex-1 py-3 bg-gray-200 rounded-full text-center"
          >
            Work
          </button>
        </div>

        {/* Saved locations */}
        <div className="mb-6">
          {savedLocations.map((location) => (
            <div
              key={location.id}
              className="flex justify-between items-center mb-4"
            >
              <span>{location.name}</span>
              <span className="text-gray-500">{location.distance}</span>
            </div>
          ))}
        </div>

        {/* Current location map */}
        <div className="mb-2">
          <h3 className="text-gray-500 uppercase text-sm tracking-wider mb-2">
            Your location
          </h3>
          <div className="relative h-48 w-full bg-gray-200 rounded-lg overflow-hidden">
            {/* This would be replaced with an actual map component */}
            <div className="absolute inset-0">
              <Image
                src="/placeholder.svg?height=200&width=400"
                alt="Map showing current location"
                fill
                className="object-cover"
              />
            </div>
            {/* Blue dot for current location */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="h-4 w-4 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="flex justify-around items-center py-3 bg-white">
        <button className="flex flex-col items-center">
          <div className="w-8 h-8 flex items-center justify-center">
            <MapPin className="h-6 w-6 text-pink-500" />
          </div>
          <span className="text-xs">Trip Status</span>
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
    </div>
  );
}
