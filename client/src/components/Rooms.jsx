import React, { useEffect, useState } from "react";

const BASE_URL = "http://localhost:3000";

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/api/rooms/get`)
      .then((res) => res.json())
      .then((data) => {
        setRooms(data.rooms || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-[#837ab6] text-xl">
        Loading rooms...
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 text-lg">
        No rooms available
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f4fa] px-6 py-10">
      <h1 className="text-3xl font-bold text-center text-[#837ab6] mb-10">
        Available Rooms
      </h1>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <div
            key={room._id}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition overflow-hidden"
          >
            {/* Image */}
            <img
              src={
                room.images?.[0]?.url
                  ? `${BASE_URL}${room.images[0].url}`
                  : "https://via.placeholder.com/400"
              }
              alt={room.title}
              className="h-52 w-full object-cover"
            />

            <div className="p-5">
              {/* Title */}
              <h2 className="text-xl font-semibold text-[#837ab6]">
                {room.title}
              </h2>

              {/* Address */}
              <p className="text-sm text-gray-500 mt-1">
                {room.address}
              </p>

              {/* Rent */}
              <p className="text-lg font-bold text-[#9d85b6] mt-2">
                Rs. {room.rent} / month
              </p>

              {/* Features (optional) */}
              {room.features.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {room.features.map((feature, index) => (
                    <span
                      key={index}
                      className="bg-[#cc8db3] text-white text-xs px-3 py-1 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              <p className="text-sm text-gray-600 mt-3">
                {room.description}
              </p>

              {/* Verified */}
              {room.isVerified && (
                <p className="text-green-600 text-sm mt-2 font-semibold">
                  ✔ Verified Room
                </p>
              )}

              {/* Contact */}
              <p className="text-sm text-gray-700 mt-2">
                📞 {room.contact}
              </p>

              <button className="mt-4 w-full bg-[#837ab6] text-white py-2 rounded-xl hover:bg-[#9d85b6] transition font-semibold">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
