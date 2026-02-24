import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiLocationMarker, HiSearch } from "react-icons/hi";
import { MdClear } from "react-icons/md";

const BASE_URL = "http://localhost:3000";

export default function SearchRooms() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    keywords: "",
    minRent: "",
    maxRent: "",
    features: "",
    lat: "",
    lng: "",
    radius: "",
  });

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= HANDLE INPUT ================= */
  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({
      keywords: "",
      minRent: "",
      maxRent: "",
      features: "",
      lat: "",
      lng: "",
      radius: "",
    });
  };

  /* ================= SEARCH ================= */
  const handleSearch = async () => {
    setLoading(true);

    const query = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key]) query.append(key, filters[key]);
    });

    try {
      const res = await fetch(
        `${BASE_URL}/api/rooms/search?${query.toString()}`
      );

      const data = await res.json();

      if (res.ok) {
        setRooms(data.rooms);
      } else {
        alert(data.message || "Search failed");
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-[#f6f4fa] px-6 py-16">

      {/* ================= TITLE ================= */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#837ab6]">
          Search Rooms
        </h1>
        <p className="text-gray-500 mt-2">
          Filter rooms by price, location & features
        </p>
      </div>

      {/* ================= FILTER CARD ================= */}
      <div className="bg-white max-w-6xl mx-auto p-8 rounded-3xl shadow-2xl">

        <div className="grid md:grid-cols-3 gap-6">

          {Object.keys(filters).map((key) => (
            <input
              key={key}
              type={key.includes("rent") || key === "radius" ? "number" : "text"}
              name={key}
              placeholder={key.replace(/([A-Z])/g, " $1")}
              value={filters[key]}
              onChange={handleChange}
              className="border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#837ab6] outline-none transition shadow-sm"
            />
          ))}

        </div>

        {/* ================= BUTTONS ================= */}
        <div className="flex gap-4 mt-6">

          <button
            onClick={handleSearch}
            className="flex-1 bg-[#837ab6] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#6c63a3] transition shadow-md"
          >
            <HiSearch className="text-xl" />
            Search Rooms
          </button>

          <button
            onClick={clearFilters}
            className="px-6 bg-gray-200 text-gray-700 rounded-xl font-medium flex items-center gap-2 hover:bg-gray-300 transition"
          >
            <MdClear />
            Clear
          </button>

        </div>
      </div>

      {/* ================= RESULTS ================= */}
      <div className="max-w-7xl mx-auto mt-16">

        {loading ? (
          <div className="text-center text-xl text-[#837ab6]">
            Searching...
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center text-gray-500 text-lg">
            No rooms found
          </div>
        ) : (
          <>
            {/* RESULT COUNT */}
            <h2 className="text-2xl font-semibold text-[#837ab6] mb-8">
              {rooms.length} Rooms Found
            </h2>

            {/* ROOM GRID */}
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <div
                  key={room._id}
                  className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2 overflow-hidden"
                >

                  {/* IMAGE */}
                  <img
                    src={
                      room.images?.[0]?.url
                        ? `${BASE_URL}${room.images[0].url}`
                        : "https://via.placeholder.com/400"
                    }
                    alt={room.title}
                    className="h-56 w-full object-cover"
                  />

                  <div className="p-6">

                    {/* TITLE */}
                    <h2 className="text-xl font-bold text-[#837ab6]">
                      {room.title}
                    </h2>

                    {/* LOCATION */}
                    <p className="text-gray-600 text-sm mt-2 flex items-center gap-2">
                      <HiLocationMarker className="text-[#837ab6]" />
                      {room.address?.municipality},{" "}
                      {room.address?.district}
                    </p>

                    {/* RENT */}
                    <p className="text-lg font-bold text-[#9d85b6] mt-3">
                      Rs. {room.rent} / month
                    </p>

                    {/* FEATURES */}
                    {room.features?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {room.features.map((f, i) => (
                          <span
                            key={i}
                            className="bg-[#cc8db3] text-white text-xs px-3 py-1 rounded-full"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* BUTTON */}
                    <button
                      onClick={() =>
                        navigate(`/rooms/${room._id}`)
                      }
                      className="mt-6 w-full bg-[#837ab6] text-white py-2.5 rounded-xl font-semibold hover:bg-[#9d85b6] transition"
                    >
                      View Details
                    </button>

                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}