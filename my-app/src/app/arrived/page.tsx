"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import { Phone, ThumbsUp, Radio, AlarmClockCheck } from "lucide-react";
import NavTask from "@/components/ui/nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { APIProvider, AdvancedMarker, Map } from "@vis.gl/react-google-maps";

// Google Maps API key
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export default function ArrivalCheckIn() {
  const router = useRouter();

  const recordArrival = () => {
    console.log("User confirmed arrival");
    // API call would go here
    router.push("/"); // Navigate back to trip status after recording arrival
  };

  const initiateEmergencyCall = () => {
    console.log("Emergency call initiated");
    // Emergency call handling would go here
  };

  const handleTripStatusClick = () => {
    router.push("/");
  };

  // Track the user’s real-time location
  const [currentLocation, setCurrentLocation] =
    useState<google.maps.LatLngLiteral | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      // watchPosition() continuously updates as the user moves
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error watching location:", error);
        }
      );

      // Clean up the watcher when component unmounts
      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  return (
    <div className="max-w-md mx-auto bg-gray-50 h-screen flex flex-col">
      <div className="bg-gray-100 relative">
        <Head>
          <title>Your Trip</title>
        </Head>

        {/* Top Navigation Bar */}
        <div className="flex px-6 pt-6 overflow-auto">
          <div className="flex justify-between items-center mb-4 pt-4 w-full">
            <div className="flex items-center space-x-3">
              <Radio className="h-6 w-6 text-pink-500" />
              <h1 className="text-xl uppercase tracking-wider font-medium">
                Status Update
              </h1>
            </div>
            <Avatar className="w-10 h-10">
              <AvatarImage src="./jett.webp" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-5">
          <div>
            <h2 className="text-sm text-gray-700 uppercase tracking-wider font-medium py-2">
              Arrival Check-in
            </h2>
            <div className="flex justify-between space-x-2">
              <h1 className="text-xl font-bold mb-4">
                Arrived at your destination?
              </h1>
              <AlarmClockCheck className="h-6 w-6 text-pink-500 mx-2" />
            </div>
            <img
              src="./progress.png"
              alt="Progress"
              className="flex justify-center w-full mb-8"
            />
          </div>

          {/* MAP SECTION */}
          <div className="mb-2 pb-6">
            {currentLocation ? (
              <APIProvider
                apiKey={API_KEY}
                loadOptions={{
                  googleMapsApiKey:
                    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
                  mapIds: ["716aee15e4ac08d3"],
                }}
              >
                <Map
                  mapId="<716aee15e4ac08d3>"
                  center={currentLocation}
                  zoom={14}
                  className="h-64 w-full rounded-md"
                >
                  <AdvancedMarker position={currentLocation} />
                </Map>
              </APIProvider>
            ) : (
              <p className="text-sm text-gray-500">Locating your position...</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center space-y-4 mb-14">
          <button
            onClick={recordArrival}
            className="w-70 p-8 bg-blue-100 text-black font-medium rounded-full flex items-center gap-3 justify-center hover:bg-blue-200 transition-colors"
          >
            <ThumbsUp className="w-6 h-6 text-blue-500" />
            Yes! Record an update
          </button>

          <button
            onClick={initiateEmergencyCall}
            className="w-70 p-8 bg-pink-100 text-black font-medium rounded-full flex items-center gap-3 justify-center hover:bg-pink-200 transition-colors"
          >
            <Phone className="w-6 h-6 text-pink-500" />
            No. Emergency Call
          </button>
        </div>
      </div>
      <NavTask />
    </div>
  );
}
