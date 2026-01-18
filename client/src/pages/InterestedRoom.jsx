import React, { useEffect, useState } from "react";
import { useAuth } from "../store/AuthContext";
import { useNavigate } from "react-router-dom";

export default function InterestedRoom() {
  const { API } = useAuth();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/api/interested/`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setRooms(data.interestedRooms);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const goToRoom = (roomId) => {
    navigate(`/rooms/${roomId}`);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  if (error)
    return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-[#f6f4fa] p-6">
      <h1 className="text-2xl font-bold text-[#837ab6] mb-6">
        My Interested Rooms
      </h1>

      {rooms.length === 0 && (
        <div className="bg-white p-6 rounded-xl shadow text-center">
          You haven't marked any rooms yet 😔
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {rooms.map((i) => {
          const isContacted = i.status === "contacted";

          return (
            <div
              key={i._id}
              className="bg-white rounded-xl shadow p-5 space-y-3"
            >
              {/* Room Info */}
              <div className="border-b pb-2">
                <h2 className="font-semibold text-lg text-[#837ab6]">
                  {i.room?.title}
                </h2>

                <p className="text-sm text-gray-600">
                  Contact: {i.room?.contact || "Not provided"}
                </p>

                <p className="text-xs text-gray-500">
                  Location:{" "}
                  {i.room?.location?.coordinates
                    ? i.room.location.coordinates.join(", ")
                    : "Not set"}
                </p>
              </div>

              {/* Status */}
              <div>
                {isContacted ? (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    Owner Contacted ✓
                  </span>
                ) : (
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                    Pending
                  </span>
                )}
              </div>

              {/* ACTION BUTTON */}
              <button
                onClick={() => goToRoom(i.room?._id)}
                className="w-full bg-[#837ab6] text-white py-2 rounded-lg hover:bg-[#9d85b6]"
              >
                View Room Details
              </button>

              <p className="text-xs text-gray-400">
                {new Date(i.createdAt).toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
