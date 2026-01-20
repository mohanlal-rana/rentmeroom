import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HiLocationMarker } from "react-icons/hi";
import { useAuth } from "../../store/AuthContext.jsx";

const OwnerRoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { API } = useAuth();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  /* ---------------- Fetch Room ---------------- */
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await fetch(`${API}/api/rooms/owner/rooms/${id}`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch room");

        const data = await res.json();
        if (!data.success) throw new Error(data.message);

        setRoom(data.room);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id, API]);

  /* ---------------- Delete Room ---------------- */
  const handleDelete = async () => {
    const confirm = window.confirm(
      "Are you sure you want to delete this room? This action cannot be undone."
    );
    if (!confirm) return;

    try {
      setDeleting(true);
      const res = await fetch(`${API}/api/rooms/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete room");

      alert("Room deleted successfully!");
      navigate("/owner/rooms");
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#837ab6] text-lg">
        Loading room details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  const formattedAddress =
    typeof room.address === "string"
      ? room.address
      : `${room.address.street}, ${room.address.wardNo}, ${room.address.municipality}, ${room.address.district}, ${room.address.province}, Nepal`;

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-[#f6f4fa] px-6 py-10">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#837ab6]">Room Details</h1>

        <button
          onClick={() => navigate(-1)}
          className="bg-[#837ab6] text-white px-5 py-2 rounded-xl hover:bg-[#9d85b6] transition"
        >
          ← Back
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-3">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-2xl font-semibold text-[#837ab6] mb-2">
              {room.title}
            </h2>

            <p className="text-gray-600 flex items-center gap-1">
              <HiLocationMarker className="text-[#837ab6]" />
              {formattedAddress}
            </p>

            <p className="text-xl font-bold text-[#9d85b6] mt-3">
              Rs. {room.rent} / month
            </p>

            <p
              className={`mt-2 font-semibold ${
                room.isVerified ? "text-green-600" : "text-yellow-600"
              }`}
            >
              {room.isVerified ? "✔ Verified" : "⏳ Pending Verification"}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Created on: {new Date(room.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold text-[#837ab6] mb-2">
              Description
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {room.description || "No description provided."}
            </p>
          </div>

          {/* Features */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold text-[#837ab6] mb-3">
              Features
            </h3>

            {room.features?.length > 0 ? (
              <ul className="grid sm:grid-cols-2 gap-2 text-gray-700">
                {room.features.map((f, i) => (
                  <li
                    key={i}
                    className="bg-[#f6f4fa] px-3 py-2 rounded-lg"
                  >
                    ✔ {f}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No features listed</p>
            )}
          </div>

          {/* Images */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold text-[#837ab6] mb-3">
              Room Images
            </h3>

            {room.images?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {room.images.map((img) => (
                  <img
                    key={img._id}
                    src={img.url.startsWith("http") ? img.url : `${API}${img.url}`}
                    alt="room"
                    className="h-40 w-full object-cover rounded-xl border"
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No images available</p>
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">
          {/* Contact */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold text-[#837ab6] mb-2">
              Contact Info
            </h3>
            <p className="text-gray-700">
              📞 {room.contact || "Not provided"}
            </p>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold text-[#837ab6] mb-2">
              Geo Location
            </h3>
            <p className="text-gray-700 text-sm">
              Latitude: {room.location?.coordinates?.[1]} <br />
              Longitude: {room.location?.coordinates?.[0]}
            </p>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl shadow p-6 space-y-3">
            <button
              onClick={() => navigate(`/owner/rooms/edit/${id}`)}
              className="w-full bg-[#837ab6] text-white py-2 rounded-xl hover:bg-[#9d85b6] transition font-semibold"
            >
              ✏️ Edit Room
            </button>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full bg-red-500 text-white py-2 rounded-xl hover:bg-red-600 transition font-semibold disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "🗑 Delete Room"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerRoomDetail;
