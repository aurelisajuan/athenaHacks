// components/TripDetails.tsx
import React from "react";

interface Destination {
  name: string;
  address: string;
}

interface TripDetailsProps {
  destination: Destination;
  estimatedArrival: string;
  travelTime: string;
}

export const TripDetails: React.FC<TripDetailsProps> = ({
  destination,
  estimatedArrival,
  travelTime,
}) => {
  return (
    <section className="px-5 pb-5">
      <div className="mb-4">
        <p className="text-gray-500 uppercase text-sm font-bold mb-1">
          DESTINATION
        </p>
        <h2 className="text-3xl font-bold">{destination.name}</h2>
        <p className="text-gray-500 text-sm">{destination.address}</p>
      </div>
      <div className="flex justify-between mb-2">
        <div>
          <p className="text-gray-500 uppercase text-sm font-bold">
            ESTIMATED ARRIVAL
          </p>
          <h3 className="text-3xl font-bold">{estimatedArrival}</h3>
        </div>
        <div>
          <p className="text-gray-500 uppercase text-sm font-bold">
            TRAVEL TIME
          </p>
          <h3 className="text-3xl font-bold">{travelTime}</h3>
        </div>
      </div>
    </section>
  );
};
