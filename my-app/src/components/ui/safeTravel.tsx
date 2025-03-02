"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface EmergencyContact {
  id: string;
  name: string;
  avatar: string;
}

interface SafeTravelProps {
  arrivalTime: string;
  emergencyContacts: EmergencyContact[];
  selectedContacts: string[];
  toggleContact: (contactId: string) => void;
}

export function SafeTravel({
  arrivalTime,
  emergencyContacts,
  selectedContacts,
  toggleContact,
}: SafeTravelProps) {
  // Build a string from the names of selected contacts.
  const selectedNames = emergencyContacts
    .filter((contact) => selectedContacts.includes(contact.id))
    .map((contact) => contact.name)
    .join(" and ");

  return (
    <div className="mb-4">
      {/* Emergency Notification Banner */}
      {selectedContacts.length > 0 && (
        <div className="bg-yellow-100 p-4 rounded-lg shadow mb-4">
          <p className="text-sm text-gray-800">
            {`Call ${selectedNames} at ${arrivalTime} if there is an emergency.`}
          </p>
        </div>
      )}

      {/* Emergency Contacts List */}
      <div className="flex flex-col space-y-3">
        {emergencyContacts.map((contact) => {
          const isSelected = selectedContacts.includes(contact.id);
          return (
            <div
              key={contact.id}
              onClick={() => toggleContact(contact.id)}
              className={`flex items-center justify-between rounded-full p-4 shadow-sm cursor-pointer transition-colors
                ${
                  isSelected
                    ? "bg-pink-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={contact.avatar} />
                  <AvatarFallback>{contact.name[0]}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{contact.name}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
