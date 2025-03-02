"use client";

import NavTask from "@/components/ui/nav";
import React, { useState, useEffect, useRef } from "react";
import { MapPin, Bell, Users } from "lucide-react";
import {
  APIProvider,
  ControlPosition,
  MapControl,
  AdvancedMarker,
  Map,
  useMap,
  useMapsLibrary,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Your Google Maps API key from globalThis or fallback to a string.
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Types for our data
type SavedLocation = {
  id: string;
  name: string;
  distance: string;
};

// Main component integrating your UI and Google Maps autocomplete
export default function StartTrip() {
  const [userName, setUserName] = useState("Lisa"); // Would come from user profile
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <APIProvider
      apiKey={API_KEY}
      solutionChannel="GMP_devsite_samples_v3_rgmautocomplete"
    >
      <div className="flex flex-col h-screen bg-gray-100">
        <div className="flex-1 p-6 overflow-auto">
          {/* Header with greeting and avatar */}
          <div className="flex justify-between items-center mb-4 pt-4">
            <h1 className="text-xl font-large">
              Hi, <span className="font-semibold">{userName}</span>
            </h1>
            <Avatar className="w-10 h-10">
              <AvatarImage src="./jett.webp" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>

          <h2 className="text-2xl font-bold mb-4">Where from?</h2>
          <div className="mb-4">
            <PlaceAutocomplete onPlaceSelect={setSelectedPlace} />
          </div>

          <h2 className="text-2xl font-bold mb-4">Where to?</h2>
          <div className="mb-4">
            <PlaceAutocomplete onPlaceSelect={setSelectedPlace} />
          </div>

          {/* Google Map with current location and autocomplete marker */}
          <div className="mb-2">
            <h3 className="text-gray-500 uppercase text-sm tracking-wider mb-2">
              Location - Destination
            </h3>
            <div className="relative h-48 w-full bg-gray-200 rounded-lg overflow-hidden">
              <Map
                mapId="bf51a910020fa25a"
                defaultZoom={3}
                defaultCenter={{ lat: 22.54992, lng: 0 }}
                gestureHandling="greedy"
                disableDefaultUI={true}
              >
                <AdvancedMarker ref={markerRef} position={null} />
                <MapControl position={ControlPosition.TOP}>
                  <div className="autocomplete-control">
                    {/* You could optionally place another autocomplete here */}
                  </div>
                </MapControl>
                <MapHandler place={selectedPlace} marker={marker} />
              </Map>
            </div>
          </div>
        </div>
        <NavTask />
      </div>
    </APIProvider>
  );
}

// MapHandler moves the map viewport and marker when a new place is selected.
interface MapHandlerProps {
  place: google.maps.places.PlaceResult | null;
  marker: google.maps.marker.AdvancedMarkerElement | null;
}

const MapHandler = ({ place, marker }: MapHandlerProps) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !place || !marker) return;

    if (place.geometry?.viewport) {
      map.fitBounds(place.geometry.viewport);
    }
    marker.position = place.geometry?.location;
  }, [map, place, marker]);

  return null;
};

// PlaceAutocomplete uses the Google Maps Places library to enable autocomplete.
interface PlaceAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
}

const PlaceAutocomplete = ({ onPlaceSelect }: PlaceAutocompleteProps) => {
  const [placeAutocomplete, setPlaceAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary("places");

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ["geometry", "name", "formatted_address"],
    };

    setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
  }, [places]);

  useEffect(() => {
    if (!placeAutocomplete) return;

    placeAutocomplete.addListener("place_changed", () => {
      onPlaceSelect(placeAutocomplete.getPlace());
    });
  }, [onPlaceSelect, placeAutocomplete]);

  return (
    <div className="autocomplete-container">
      <input
        ref={inputRef}
        className="w-full py-3 px-4 bg-white rounded-full text-gray-700 focus:outline-none"
        placeholder="Enter your destination"
      />
    </div>
  );
};
