// page.tsx (or TripInfo.tsx)
"use client";

import React, { useState } from "react";
import NavTask from "@/components/ui/nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Footprints } from "lucide-react";
import Head from "next/head";
import { TripDetails } from "@/components/ui/tripDetails";
import { SafeTravel } from "@/components/ui/safeTravel";

// Types for our data
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

// Dummy data that would come from the backend
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

// Contact Item Component
const ContactItem = ({
  contact,
  isSelected,
  toggleContact,
}: ContactItemProps) => {
  return (
    <div
      onClick={() => toggleContact(contact.id)}
      className={`cursor-pointer flex items-center justify-between rounded-full p-7 shadow-sm mb-3 transition-colors ${
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
      <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-blue-500">
        <MessageCircle size={20} />
      </button>
    </div>
  );
};

export default function TripInfo() {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
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

  const selectedNames = tripData.emergencyContacts
    .filter((c) => selectedContacts.includes(c.id))
    .map((c) => c.name)
    .join(" and ");

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Head>
        <title>Your Trip</title>
      </Head>

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

      <div className="px-6 mb-4">
        <h2 className="text-lg font-bold mb-1">Safe Travel</h2>
        {selectedNames ? (
          <p className="text-sm text-gray-700">
            Call <strong>{selectedNames}</strong> at{" "}
            <strong>{tripData.estimatedArrival}</strong> if there is an
            emergency
          </p>
        ) : (
          <p className="text-sm text-gray-700">
            Select up to two emergency contacts below
          </p>
        )}
      </div>

      {/* Emergency Contacts */}
      <section className="px-5 flex-1">
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

      {/* <TripDetails
        destination={tripData.destination}
        estimatedArrival={tripData.estimatedArrival}
        travelTime={tripData.travelTime}
      /> */}

      <NavTask />
    </div>
  );
}
