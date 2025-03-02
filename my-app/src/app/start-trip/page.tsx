"use client";

import NavTask from "@/components/ui/nav";
import React, { useState, useEffect, useRef } from "react";
import {
  APIProvider,
  ControlPosition,
  MapControl,
  AdvancedMarker,
  Map,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

// Google Maps API key
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

// Default location (USC)
const USC_LAT_LNG = { lat: 34.0224, lng: -118.2851 };

// Main component integrating UI and Google Maps autocomplete
export default function StartTrip() {
  const router = useRouter();

  const [userName, setUserName] = useState("Lisa");
  const [startLocation, setStartLocation] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [mapCenter, setMapCenter] = useState(USC_LAT_LNG);
  const [selectedInterval, setSelectedInterval] = useState(0);

  // const userId = localStorage.getItem("user_id"); // Retrieve stored user ID
  // const [userId, setUserId] = useState<string | null>(null);
  //
  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     const storedUserId = localStorage.getItem("user_id");
  //     setUserId(storedUserId);
  //   }
  // }, []);
  const userId = 21;

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          console.log("Geolocation permission denied. Defaulting to USC.");
        }
      );
    }
  }, []);

  // Function to update the map when a start location is selected
  const handleStartLocationSelect = (place: google.maps.places.PlaceResult) => {
    if (place.formatted_address) {
      setStartLocation(place.formatted_address);
    }
    if (place.geometry?.location) {
      setMapCenter({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    }
  };

  // Function to update the map when a destination is selected
  const handleDestinationSelect = (place: google.maps.places.PlaceResult) => {
    if (place.formatted_address) {
      setDestination(place.formatted_address);
    }
    if (place.geometry?.location) {
      setMapCenter({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    }
  };

  const startTrip = async () => {
  if (!startLocation.trim()) {
    alert("Start location cannot be empty");
    return;
  }
  if (!destination.trim()) {
    alert("Destination cannot be empty");
    return;
  }

  const API_URL = "http://localhost:8000";

  const tripData = new FormData();
  tripData.append("user_id", userId || "20"); // Ensure userId is available
  tripData.append("start_location", startLocation);
  tripData.append("destination", destination);

  try {
    const response = await fetch(`${API_URL}/start`, {
      method: "POST",
      body: tripData,
    });

    const result = await response.json();
    if (response.ok) {
      // alert(`Trip started successfully! ETA: ${result.eta} minutes`);

      // ✅ Save ETA to localStorage
      localStorage.setItem("trip_eta", result.eta);

      // ✅ Navigate to trip-status page
      router.push("/trip-info");
    } else {
      alert(`Failed to start trip: ${result.detail}`);
    }
  } catch (error) {
    console.error("Error starting trip:", error);
    alert("An error occurred while starting the trip.");
  }
};


  // Function to start a trip
  // const startTrip = async () => {
  //   // if (!userId) {
  //   //   alert("User ID is required");
  //   //   return;
  //   // }
  //   if (!startLocation.trim()) {
  //     alert("Start location cannot be empty");
  //     return;
  //   }
  //   if (!destination.trim()) {
  //     alert("Destination cannot be empty");
  //     return;
  //   }
  //
  //   const API_URL = "http://localhost:8000";
  //
  //   const tripData = new FormData();
  //   tripData.append("user_id", 20);
  //   tripData.append("start_location", startLocation);
  //   tripData.append("destination", destination);
  //
  //   try {
  //     const response = await fetch(`${API_URL}/start`, {
  //       method: "POST",
  //       body: tripData,
  //     });
  //
  //     const result = await response.json();
  //     if (response.ok) {
  //       alert(`Trip started successfully! ETA: ${result.eta} minutes`);
  //     } else {
  //       alert(`Failed to start trip: ${result.detail}`);
  //     }
  //   } catch (error) {
  //     console.error("Error starting trip:", error);
  //     alert("An error occurred while starting the trip.");
  //   }
  // };

  return (
    <APIProvider apiKey={API_KEY}>
      <div className="flex flex-col h-screen bg-gray-100">
        <div className="flex-1 p-6 overflow-auto">
          {/* Header with greeting and avatar */}
          <div className="flex justify-between items-center mb-4 pt-4">
            <h1 className="text-xl font-large">
              Hi,{" "}
              <span className="font-semibold text-xl text-pink-500">
                {userName}
              </span>
            </h1>
            <Avatar className="w-10 h-10">
              <AvatarImage src="./jett.webp" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>

          <h2 className="text-2xl font-bold mb-4">Where from?</h2>
          <div className="mb-4">
            <PlaceAutocomplete onPlaceSelect={handleStartLocationSelect} />
          </div>

          <h2 className="text-2xl font-bold mb-4">Where to?</h2>
          <div className="mb-4">
            <PlaceAutocomplete onPlaceSelect={handleDestinationSelect} />
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Intervals for check in? (min)</h2>
            <div className="mb-4">
              <select
                className="w-full p-2 border rounded-md bg-white"
                value={selectedInterval}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setSelectedInterval(Number(e.target.value))
                }
              >
                <option value={0}>Don't check-in</option>
                {Array.from({ length: 120 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Start Trip Button */}
          <button
            onClick={startTrip}
            className="w-full bg-white text-black text-lg font-semibold py-3 px-6 rounded-lg
                       border border-gray-300 hover:bg-gray-100 active:scale-95 transition duration-200
                       ease-in-out shadow-md hover:shadow-lg"
          >
            Start Trip
          </button>

          {/* Google Map */}
          <div className="mb-2 mt-6">
            <h3 className="text-gray-500 uppercase text-sm tracking-wider mb-2">
              Location - Destination
            </h3>
            <div className="relative h-48 w-full bg-gray-200 rounded-lg overflow-hidden">
              <Map
                mapId="bf51a910020fa25a"
                defaultZoom={15}
                center={mapCenter}
                gestureHandling="greedy"
                disableDefaultUI={true}
              >
                <AdvancedMarker position={mapCenter} />
                <MapControl position={ControlPosition.TOP}>
                  <div className="autocomplete-control"></div>
                </MapControl>
              </Map>
            </div>
          </div>
        </div>
        <NavTask />
      </div>
    </APIProvider>
  );
}

// PlaceAutocomplete component
interface PlaceAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
}

const PlaceAutocomplete = ({ onPlaceSelect }: PlaceAutocompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary("places");

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const autocomplete = new places.Autocomplete(inputRef.current, {
      fields: ["geometry", "formatted_address"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      onPlaceSelect(place);
    });
  }, [places, onPlaceSelect]);

  return (
    <div className="autocomplete-container">
      <input
        ref={inputRef}
        className="w-full py-3 px-4 bg-white rounded-full text-gray-700 focus:outline-none"
        placeholder="Enter location"
      />
    </div>
  );
};
