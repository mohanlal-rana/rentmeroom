import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiLocationMarker } from "react-icons/hi";
import { useAuth } from "../../store/AuthContext.jsx";

const OwnerRoomManagement = () => {
  const { API } = useAuth();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------------- Fetch Owner Rooms ---------------- */
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch(`${API}/api/rooms/owner/rooms`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch rooms");

        const data = await res.json();
        if (!data.success) throw new Error(data.message);

        setRooms(data.rooms || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [API]);

  /* ---------------- States ---------------- */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-[#837ab6] text-xl">
        Loading your rooms...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-[#f6f4fa] px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#837ab6]">
          My Rooms
        </h1>

        <Link
          to="add"
          className="bg-[#837ab6] text-white px-5 py-2 rounded-lg
                     font-semibold hover:bg-[#9d85b6] transition"
        >
          ➕ Add New Room
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-lg">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-[#ece9f7] text-[#837ab6] text-left">
              <th className="px-6 py-4 font-semibold">Room</th>
              <th className="px-6 py-4 font-semibold">Address</th>
              <th className="px-6 py-4 font-semibold">Rent</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Created</th>
              <th className="px-6 py-4 font-semibold text-center">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {rooms.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-10 text-gray-400"
                >
                  No rooms added yet.
                </td>
              </tr>
            )}

            {rooms.map((room, index) => (
              <tr
                key={room._id}
                className={`border-t hover:bg-[#f6f4fa] transition ${
                  index % 2 === 0 ? "bg-white" : "bg-[#faf9fe]"
                }`}
              >
                {/* Room title + image */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        room.images?.[0]?.url
                          ? `${API}${room.images[0].url}`
                          : "https://via.placeholder.com/80"
                      }
                      alt={room.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <span className="font-semibold text-[#837ab6]">
                      {room.title}
                    </span>
                  </div>
                </td>

                {/* Address */}
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div className="flex items-start gap-1">
                    <HiLocationMarker className="text-[#837ab6] mt-1" />
                    <span>
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
                    </span>
                  </div>
                </td>

                {/* Rent */}
                <td className="px-6 py-4 font-semibold text-[#9d85b6]">
                  Rs. {room.rent}
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      room.isVerified
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {room.isVerified ? "Verified" : "Pending"}
                  </span>
                </td>

                {/* Created */}
                <td className="px-6 py-4 text-sm text-gray-400">
                  {new Date(room.createdAt).toLocaleDateString()}
                </td>

                {/* Action */}
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => navigate(`/owner/rooms/${room._id}`)}
                    className="bg-[#837ab6] text-white px-4 py-2 rounded-lg
                               hover:bg-[#9d85b6] transition text-sm font-semibold"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OwnerRoomManagement;
