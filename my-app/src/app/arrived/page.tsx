"use client";

import { useRouter } from "next/navigation";
import { Phone, ThumbsUp, User } from "lucide-react";
import Head from "next/head";
import { Radio, AlarmClockCheck } from "lucide-react";
import NavTask from "@/components/ui/nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ... (keep the existing interfaces and MapPreview component)

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

  // ... (keep the existing locationData)

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen flex flex-col">
      <div className="flex flex-col h-screen bg-gray-100 relative overflow-hidden">
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
        <div className="px-5 flex-1">
          <div>
            <h2 className="text-sm text-gray-700 uppercase tracking-wider font-medium py-6">
              Arrival Check-in
            </h2>
            <div className="flex justify-between space-x-2">
              <h1 className="text-xl font-bold mb-4">
                Arrived at your destination?
              </h1>
              <AlarmClockCheck className="h-6 w-6 text-pink-500 mx-2" />
            </div>
          </div>

          {/* ... (keep the existing map section) */}

          {/* Action Buttons */}
          <div className="space-y-4 mb-10">
            <button
              onClick={recordArrival}
              className="w-full py-4 px-6 bg-blue-100 text-black font-medium rounded-full flex items-center justify-center gap-3 hover:bg-blue-200 transition-colors"
            >
              <ThumbsUp className="w-6 h-6 text-blue-500" />
              Yes! Record an update
            </button>

            <button
              onClick={initiateEmergencyCall}
              className="w-full py-4 px-6 bg-pink-100 text-black font-medium rounded-full flex items-center justify-center gap-3 hover:bg-pink-200 transition-colors"
            >
              <Phone className="w-6 h-6 text-pink-500" />
              No. Emergency Call
            </button>
          </div>
        </div>

        <NavTask />
      </div>
    </div>
  );
}
