import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { HiLocationMarker, HiOutlineCash, HiCheckCircle, HiHeart } from "react-icons/hi";
import {
  MdOutlineBedroomParent,
  MdOutlineBathroom,
  MdKitchen,
} from "react-icons/md";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const BASE_URL = "http://localhost:3000";

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function RoomDetails() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [interested, setInterested] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  useEffect(() => {
    fetch(`${BASE_URL}/api/rooms/get/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setRoom(data.room);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, [id]);

  const handleMarkInterested = async () => {
    setButtonLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/interested/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ roomId: id }),
      });
      const data = await res.json();
      if (res.ok) {
        setInterested(true);
        alert("You have marked interest in this room!");
      } else {
        alert(data.message || "Failed to mark interest");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    } finally {
      setButtonLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-[#837ab6] text-xl">
        Loading room details...
      </div>
    );

  if (!room)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 text-lg">
        Room not found
      </div>
    );

  const coordinates =
    room.location?.coordinates && room.location.coordinates.length === 2
      ? [room.location.coordinates[1], room.location.coordinates[0]]
      : [0, 0];

  return (
    <div className="min-h-screen bg-[#f6f4fa] p-4 sm:p-6 flex justify-center">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col lg:flex-row gap-6">
        {/* Left Side: Image + Details */}
        <div className="flex-1 p-6 flex flex-col gap-4">
          <img
            src={
              room.images?.[0]?.url
                ? `${BASE_URL}${room.images[0].url}`
                : "https://via.placeholder.com/800x400?text=No+Image"
            }
            alt={room.title}
            className="w-full h-80 sm:h-96 md:h-[28rem] object-cover rounded-xl"
          />

          <h1 className="text-3xl font-bold text-[#837ab6]">{room.title}</h1>

          <p className="flex items-center text-gray-600">
            <HiLocationMarker className="w-5 h-5 text-[#837ab6] mr-2" />
            {[
              room.address.wardNo ? `Ward ${room.address.wardNo}` : null,
              room.address.municipality,
              room.address.district,
              room.address.province,
              room.address.country,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>

          <p className="flex items-center text-gray-700">
            <HiOutlineCash className="w-5 h-5 text-[#837ab6] mr-2" />
            <span className="text-lg font-bold text-[#9d85b6]">
              Rs. {room.rent} / month
            </span>
          </p>

          {room.features.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-2">
              {room.features.map((feature, index) => (
                <span
                  key={index}
                  className="bg-[#cc8db3] text-white text-xs px-3 py-1 rounded-full flex items-center gap-1"
                >
                  {feature.toLowerCase().includes("bedroom") && (
                    <MdOutlineBedroomParent className="w-4 h-4" />
                  )}
                  {feature.toLowerCase().includes("bathroom") && (
                    <MdOutlineBathroom className="w-4 h-4" />
                  )}
                  {feature.toLowerCase().includes("kitchen") && (
                    <MdKitchen className="w-4 h-4" />
                  )}
                  {feature}
                </span>
              ))}
            </div>
          )}

          <p className="text-gray-600">{room.description}</p>

          {room.isVerified && (
            <p className="flex items-center text-green-600 font-semibold text-sm mt-2">
              <HiCheckCircle className="w-5 h-5 mr-2" />
              Verified Room
            </p>
          )}

          {/* Mark Interested Button */}
          <button
            onClick={handleMarkInterested}
            disabled={interested || buttonLoading}
            className={`mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl font-semibold transition ${
              interested
                ? "bg-green-600 text-white cursor-not-allowed"
                : "bg-[#837ab6] text-white hover:bg-[#9d85b6]"
            }`}
          >
            <HiHeart className="w-5 h-5" />
            {interested
              ? "Marked Interested"
              : buttonLoading
              ? "Loading..."
              : "Mark Interested"}
          </button>
        </div>

        {/* Right Side: Map */}
        <div className="flex-1 rounded-xl overflow-hidden h-[400px] sm:h-[1000px] md:h-[600px] lg:h-auto">
          <MapContainer
            center={coordinates}
            zoom={16}
            scrollWheelZoom={false}
            className="h-full w-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            <Marker position={coordinates}>
              <Popup>{room.title}</Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
