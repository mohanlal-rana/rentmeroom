import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiLocationMarker, HiHeart } from "react-icons/hi";
import { useAuth } from "../store/AuthContext.jsx";

export default function SavedRooms() {
  const { API } = useAuth();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedRooms();
  }, [API]);

  const fetchSavedRooms = async () => {
    try {
      const res = await fetch(`${API}/api/rooms/saved`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch saved rooms");

      const data = await res.json();
      setRooms(data.savedRooms || []);
    } catch (error) {
      console.error("Error fetching saved rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 UNSAVE FUNCTION
  const handleUnsave = async (roomId) => {
    try {
      const res = await fetch(`${API}/api/rooms/unsave/${roomId}`, {
        method: "PUT",
        credentials: "include",
      });

      if (!res.ok) {
        alert("Failed to unsave");
        return;
      }

      // ✅ Optimistic UI Update (remove from list immediately)
      setRooms((prev) => prev.filter((room) => room._id !== roomId));
    } catch (error) {
      console.error("Unsave error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-[#837ab6] text-xl">
        Loading saved rooms...
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-500 text-lg">
        No saved rooms yet ❤️
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f4fa] px-6 py-10">
      <h1 className="text-3xl font-bold text-center text-[#837ab6] mb-10">
        Saved Rooms ❤️
      </h1>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <div
            key={room._id}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition overflow-hidden relative"
          >
            {/* 🔥 Unsave Button (Heart Icon) */}
            <button
              onClick={() => handleUnsave(room._id)}
              className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:scale-110 transition"
            >
              <HiHeart className="w-6 h-6 text-red-500" />
            </button>

            {/* Image */}
            <img
              src={
                room.images?.[0]?.url
                  ? `${API}${room.images[0].url}`
                  : "https://via.placeholder.com/400"
              }
              alt={room.title}
              className="h-52 w-full object-cover"
            />

            <div className="p-5">
              <h2 className="text-xl font-semibold text-[#837ab6]">
                {room.title}
              </h2>

              {/* Address */}
              <p className="text-gray-600 text-sm mt-1 flex items-center gap-1">
                <HiLocationMarker className="text-[#837ab6] w-5 h-5" />
                {[
                  room.address?.wardNo
                    ? `Ward ${room.address.wardNo}`
                    : null,
                  room.address?.municipality,
                  room.address?.district,
                  room.address?.province,
                  room.address?.country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>

              <p className="text-lg font-bold text-[#9d85b6] mt-2">
                Rs. {room.rent} / month
              </p>

              {room.isVerified && (
                <p className="text-green-600 text-sm mt-2 font-semibold">
                  ✔ Verified
                </p>
              )}

              <button
                className="mt-4 w-full bg-[#837ab6] text-white py-2 rounded-xl hover:bg-[#9d85b6] transition font-semibold"
                onClick={() => navigate(`/rooms/${room._id}`)}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}