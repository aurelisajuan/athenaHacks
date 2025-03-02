"use client";

export interface EmergencyContact {
  id: string;
  name: string;
  avatar: string;
}

export interface TripData {
  destination: {
    name: string;
    address: string;
  };
  estimatedArrival: string;
  travelTime: string;
  userAvatar: string;
  emergencyContacts: EmergencyContact[];
}

// Dummy data that would come from the backend
export const tripData: TripData = {
  destination: {
    name: "Century City",
    address: "10250 Santa Monica Blvd. 90067 Los Angeles CA",
  },
  estimatedArrival: "7:40 PM",
  travelTime: "26 min",
  userAvatar: "/placeholder.svg?height=40&width=40",
  emergencyContacts: [
    { id: "0", name: "Mom", avatar: "/placeholder.svg?height=40&width=40" },
    { id: "1", name: "Dad", avatar: "/placeholder.svg?height=40&width=40" },
    { id: "2", name: "Kaitlin", avatar: "/placeholder.svg?height=40&width=40" },
    { id: "3", name: "Ellie", avatar: "/placeholder.svg?height=40&width=40" },
  ],
};
