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
  const [slip, setSlip] = useState(null);
  const [uploadingSlip, setUploadingSlip] = useState(false);

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
  const openInGoogleMaps = () => {
    const lat = room?.location?.coordinates?.[1];
    const lng = room?.location?.coordinates?.[0];

    if (!lat || !lng) {
      alert("Location not available");
      return;
    }

    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, "_blank");
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

  const handleSlipUpload = async () => {
    if (!slip) return alert("Please select a file first");

    const formData = new FormData();
    formData.append("slip", slip);

    try {
      setUploadingSlip(true);
      const res = await fetch(`${API}/api/rooms/${id}/uplaod/paymentslip`, {
        method: "PUT",
        body: formData,
        // Note: Don't set Content-Type header manually when using FormData
        credentials: "include",
      });

      const data = await res.json();
      if (data.success) {
        alert("Payment slip uploaded!");
        setRoom(data.room); // Update UI with new data
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadingSlip(false);
    }
  };
  const updateAvailability = async (action) => {
    try {
      const endpoint = action === "increase" ? "increase" : "decrease";
      const res = await fetch(`${API}/api/rooms/${id}/avialableroom/${endpoint}`, {
        method: "PUT",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setRoom(data.room); // Refresh UI
    } catch (err) {
      alert(err.message);
    }
  };

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
              className={`mt-2 font-semibold ${room.isVerified ? "text-green-600" : "text-yellow-600"
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
            <button
              onClick={openInGoogleMaps}
              className="w-full bg-green-500 text-white py-2 rounded-xl hover:bg-green-600 transition font-semibold"
            >
              📍 Open in Google Maps
            </button>
          </div>
          {/* Availability Management */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold text-[#837ab6] mb-4">
              Manage Availability
            </h3>

            <div className="flex items-center justify-between bg-[#f6f4fa] p-4 rounded-xl">
              <div>
                <p className="text-sm text-gray-500">Available Rooms</p>
                <p className="text-2xl font-bold text-[#837ab6]">
                  {room.avilableRoom} <span className="text-sm font-normal text-gray-400">/ {room.noOfRoom}</span>
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => updateAvailability("decrease")}
                  disabled={room.avilableRoom <= 0}
                  className="w-10 h-10 flex items-center justify-center bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:opacity-30 transition font-bold text-xl"
                >
                  −
                </button>
                <button
                  onClick={() => updateAvailability("increase")}
                  disabled={room.avilableRoom >= room.noOfRoom}
                  className="w-10 h-10 flex items-center justify-center bg-green-100 text-green-600 rounded-lg hover:bg-green-200 disabled:opacity-30 transition font-bold text-xl"
                >
                  +
                </button>
              </div>
            </div>

            <p className="text-[10px] text-gray-400 mt-2 italic">
              * Decrease availability when a room is rented out.
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
          {/* Payment Slip Upload */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold text-[#837ab6] mb-3">
              Payment Slip
            </h3>

            {room.paymentSlip?.url ? (
              <div className="space-y-2">
                <img
                  src={`${API}${room.paymentSlip.url}`}
                  alt="Payment Slip"
                  onClick={() => window.open(`${API}${room.paymentSlip.url}`, "_blank")}
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <p className="text-xs text-green-600 font-medium text-center">Slip Uploaded ✓</p>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSlip(e.target.files[0])}
                  className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#f6f4fa] file:text-[#837ab6] hover:file:bg-[#ece9f5]"
                />
                <button
                  onClick={handleSlipUpload}
                  disabled={uploadingSlip || !slip}
                  className="w-full bg-[#9d85b6] text-white py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
                >
                  {uploadingSlip ? "Uploading..." : "Upload Slip"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerRoomDetail;
