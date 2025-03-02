// page.tsx (or TripInfo.tsx)
"include client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Footprints, MapPin, Bell, Users } from "lucide-react";
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

// Contact Item Component
const ContactItem = ({ contact }: { contact: EmergencyContact }) => {
  return (
    <div className="flex items-center justify-between bg-white rounded-full p-7 shadow-sm mb-3">
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
  const notifyContact = (contactId: string) => {
    console.log(`Notifying contact with ID: ${contactId}`);
  };

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

      {/* Use the new TripDetails component */}
      <TripDetails
        destination={tripData.destination}
        estimatedArrival={tripData.estimatedArrival}
        travelTime={tripData.travelTime}
      />

      {/* Emergency Contacts */}
      <section className="px-5 flex-1">
        <p className="text-gray-500 uppercase text-sm font-bold mb-4">
          NOTIFY EMERGENCY CONTACTS
        </p>
        <div>
          {tripData.emergencyContacts.map((contact) => (
            <ContactItem key={contact.id} contact={contact} />
          ))}
        </div>
      </section>

      {/* Bottom navigation */}
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
    </div>
  );
}
