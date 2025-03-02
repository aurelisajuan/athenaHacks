"use client";

import React, { useState } from "react";
import Head from "next/head";
import NavTask from "@/components/ui/nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Footprints } from "lucide-react";

interface EmergencyContact {
  id: string;
  name: string;
  avatar: string;
}

interface TripData {
  destination: {
    name: string;
    address: string;
  };
  estimatedArrival: string;
  travelTime: string;
  userAvatar: string;
  emergencyContacts: EmergencyContact[];
}

// Dummy data from backend
const tripData: TripData = {
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

interface ContactItemProps {
  contact: EmergencyContact;
  isSelected: boolean;
  toggleContact: (contactId: string) => void;
}

// Contact Item Component with the styling from your second code
const ContactItem = ({
  contact,
  isSelected,
  toggleContact,
}: ContactItemProps) => {
  return (
    <div
      onClick={() => toggleContact(contact.id)}
      className={`cursor-pointer flex items-center justify-between rounded-full p-8 shadow-sm mb-3 transition-colors ${
        isSelected ? "bg-pink-500 text-white" : "bg-white text-gray-800"
      }`}
    >
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src="./sage.webp" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <span className="font-medium">{contact.name}</span>
      </div>
      <button
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
          isSelected ? "bg-pink-300 text-white" : "bg-gray-100 text-gray-500"
        }`}
      >
        <MessageCircle size={20} />
      </button>
    </div>
  );
};

export default function TripInfo() {
  // Track selected emergency contacts (up to two)
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  // View can be "tripDetails" (select contacts) or "safeTravel" (notification view)
  const [view, setView] = useState<"tripDetails" | "safeTravel">("tripDetails");

  const toggleContact = (contactId: string) => {
    setSelectedContacts((prev) => {
      if (prev.includes(contactId)) {
        return prev.filter((id) => id !== contactId);
      }
      if (prev.length < 2) {
        return [...prev, contactId];
      }
      return prev;
    });
  };

  // Build a display string of the selected contacts' names
  const selectedNames = tripData.emergencyContacts
    .filter((c) => selectedContacts.includes(c.id))
    .map((c) => c.name)
    .join(" and ");

  return (
    <div className="flex flex-col h-screen bg-gray-100 relative overflow-hidden">
      <Head>
        <title>Your Trip</title>
      </Head>

      {/* Top Navigation Bar */}
      <div className="flex px-6 pt-6 overflow-auto">
        <div className="flex justify-between items-center mb-4 pt-4 w-full">
          <div className="flex items-center space-x-3">
            <Footprints className="h-6 w-6 text-pink-500" />
            <h1 className="text-xl uppercase tracking-wider font-medium">
              Your Trip
            </h1>
          </div>
          <Avatar className="w-10 h-10">
            <AvatarImage src="./jett.webp" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Slider Container */}
      <div className="relative flex-1">
        {/* Trip Details (Contact Selection) Slide */}
        <div
          className={`absolute top-0 w-full h-full transition-transform duration-300 ${
            view === "tripDetails" ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="px-6 mb-4">
            <h2 className="text-lg font-bold mb-1">Safe Travel</h2>
            {selectedNames ? (
              <p className="text-sm text-gray-700">
                Call <strong>{selectedNames}</strong> at{" "}
                <strong>{tripData.estimatedArrival}</strong> if there is an
                emergency.
              </p>
            ) : (
              <p className="text-sm text-gray-700">
                Select up to two emergency contacts below
              </p>
            )}
          </div>

          <section className="px-5">
            <p className="text-gray-500 uppercase text-sm font-bold mb-4">
              Notify Emergency Contacts
            </p>
            <div>
              {tripData.emergencyContacts.map((contact) => (
                <ContactItem
                  key={contact.id}
                  contact={contact}
                  isSelected={selectedContacts.includes(contact.id)}
                  toggleContact={toggleContact}
                />
              ))}
            </div>
          </section>

          <div className="flex justify-center px-6 py-4">
            <button
              onClick={() => setView("safeTravel")}
              disabled={selectedContacts.length === 0}
              className={`flex items-center justify-center px-4 py-2 rounded-md font-semibold ${
                selectedContacts.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-pink-500 text-white"
              }`}
            >
              Continue
            </button>
          </div>
        </div>

        {/* Safe Travel Slide */}
        <div
          className={`absolute top-0 w-full h-full transition-transform duration-300 ${
            view === "safeTravel" ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="px-6 mb-4">
            <h2 className="text-lg font-bold mb-1">Safe Travel</h2>
            {selectedNames ? (
              <p className="text-sm text-gray-700">
                Call <strong>{selectedNames}</strong> at{" "}
                <strong>{tripData.estimatedArrival}</strong> if there is an
                emergency.
              </p>
            ) : (
              <p className="text-sm text-gray-700">No contacts selected.</p>
            )}
          </div>

          <section className="px-5">
            <p className="text-gray-500 uppercase text-sm font-bold mb-4">
              Your Selected Contacts
            </p>
            <div>
              {tripData.emergencyContacts
                .filter((c) => selectedContacts.includes(c.id))
                .map((contact) => (
                  <ContactItem
                    key={contact.id}
                    contact={contact}
                    isSelected={true}
                    toggleContact={toggleContact}
                  />
                ))}
            </div>
          </section>

          <div className="flex justify-center px-6 py-4">
            <button
              onClick={() => setView("tripDetails")}
              className="px-4 py-2 rounded-md font-semibold bg-gray-200 text-gray-700"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <NavTask />
    </div>
  );
}
