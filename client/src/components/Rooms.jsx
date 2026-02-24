import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiLocationMarker,
  HiOutlineHeart,
  HiHeart,
} from "react-icons/hi";
import { useAuth } from "../store/AuthContext.jsx";


export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [savedRooms, setSavedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const {API} = useAuth();

  useEffect(() => {
    // Fetch all rooms
    fetch(`${API}/api/rooms/get`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setRooms(data.rooms || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });

    // Fetch saved rooms (cookie automatically sent)
    fetch(`${API}/api/rooms/saved`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) return null; // user not logged in
        return res.json();
      })
      .then((data) => {
        if (data?.savedRooms) {
          const ids = data.savedRooms.map((room) => room._id);
          setSavedRooms(ids);
        }
      })
      .catch((err) => console.error("Saved fetch error:", err));
  }, []);

  const toggleSave = async (roomId) => {
    const isSaved = savedRooms.includes(roomId);

    const url = isSaved
      ? `${API}/api/rooms/unsave/${roomId}`
      : `${API}/api/rooms/save/${roomId}`;

    try {
      const res = await fetch(url, {
        method: "PUT",
        credentials: "include", // IMPORTANT for cookies
      });
console.log(res)
      if (!res.ok) {
        alert("Please login first");
        return;
      }

      const data = await res.json();

      if (data.success) {
        if (isSaved) {
          setSavedRooms(savedRooms.filter((id) => id !== roomId));
        } else {
          setSavedRooms([...savedRooms, roomId]);
        }
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

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
            {/* Image + Heart */}
            <div className="relative">
              <img
                src={
                  room.images?.[0]?.url
                    ? `${API}${room.images[0].url}`
                    : "https://via.placeholder.com/400"
                }
                alt={room.title}
                className="h-52 w-full object-cover"
              />

              <button
                onClick={() => toggleSave(room._id)}
                className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:scale-110 transition"
              >
                {savedRooms.includes(room._id) ? (
                  <HiHeart className="w-6 h-6 text-red-500" />
                ) : (
                  <HiOutlineHeart className="w-6 h-6 text-gray-600" />
                )}
              </button>
            </div>

            <div className="p-5">
              <h2 className="text-xl font-semibold text-[#837ab6]">
                {room.title}
              </h2>

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

              {room.features?.length > 0 && (
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

              <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                {room.description}
              </p>

              {room.isVerified && (
                <p className="text-green-600 text-sm mt-2 font-semibold">
                  ✔ Verified Room
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