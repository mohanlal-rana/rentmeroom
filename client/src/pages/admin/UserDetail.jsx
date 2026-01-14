import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext.jsx";

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { API } = useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API}/api/users/${id}`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch user");

        const data = await res.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [API, id]);

  // ✅ VERIFY OWNER (ONE TIME)
  const handleVerifyOwner = async () => {
    try {
      setProcessing(true);

      const res = await fetch(`${API}/api/users/verify/${id}`, {
        method: "PUT",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Verification failed");

      const updatedUser = await res.json();
      setUser(updatedUser);
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // ✅ BLOCK / ACTIVATE USER
  const handleToggleActive = async () => {
    try {
      setProcessing(true);

      const res = await fetch(`${API}/api/users/toggle-active/${id}`, {
        method: "PUT",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Action failed");

      const updatedUser = await res.json();
      setUser(updatedUser);
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-[#837ab6]">
        Loading user details...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );

  // ✅ IMAGE HANDLING
  const profileImage = user.owner?.profileImage?.startsWith("http")
    ? user.owner.profileImage
    : user.owner?.profileImage
    ? `${API}${user.owner.profileImage}`
    : null;

  const govIDImage = user.owner?.govIDImage?.startsWith("http")
    ? user.owner.govIDImage
    : user.owner?.govIDImage
    ? `${API}${user.owner.govIDImage}`
    : null;

  return (
    <div className="min-h-screen bg-[#f6f4fa] px-6 py-10">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#837ab6]">User Details</h1>

        <button
          onClick={() => navigate(-1)}
          className="bg-[#837ab6] text-white px-5 py-2 rounded-xl"
        >
          ← Back
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-3">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* BASIC INFO */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-2xl font-semibold text-[#837ab6]">
              {user.name}
            </h2>
            <p className="text-gray-600">{user.email}</p>

            <p className="mt-3 font-semibold capitalize text-[#9d85b6]">
              Role: {user.role}
            </p>

            <p
              className={`mt-2 font-semibold ${
                user.isActive ? "text-green-600" : "text-red-500"
              }`}
            >
              {user.isActive ? "🟢 Active" : "🔴 Blocked"}
            </p>

            {user.role === "owner" && (
              <p
                className={`mt-1 font-semibold ${
                  user.owner?.isVerified ? "text-green-600" : "text-red-500"
                }`}
              >
                {user.owner?.isVerified
                  ? "✔ Owner Verified"
                  : "✖ Owner Not Verified"}
              </p>
            )}

            <p className="text-xs text-gray-400 mt-2">
              Joined: {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* OWNER SECTION */}
          {user.role === "owner" && (
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-lg font-semibold text-[#837ab6] mb-4">
                Owner Profile
              </h3>

              {/* PROFILE IMAGE */}
              <div className="mb-6">
                <p className="text-sm font-semibold mb-2">Profile Image</p>
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    onClick={() => window.open(profileImage, "_blank")}
                    className="h-40 w-40 object-cover rounded-xl border cursor-pointer"
                  />
                ) : (
                  <p className="text-gray-400 text-sm">No profile image</p>
                )}
              </div>

              {/* OWNER DETAILS */}
              <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-700">
                <p>
                  <strong>Phone:</strong> {user.owner?.phone || "N/A"}
                </p>
                <p>
                  <strong>Address:</strong> {user.owner?.address || "N/A"}
                </p>
                <p>
                  <strong>Gov ID Type:</strong> {user.owner?.govIDType || "N/A"}
                </p>
                <p>
                  <strong>Gov ID Number:</strong>{" "}
                  {user.owner?.govIDNumber || "N/A"}
                </p>
                <p>
                  <strong>Properties:</strong> {user.owner?.propertyCount || 0}
                </p>
                <p>
                  <strong>Facebook:</strong> {user.owner?.facebook || "N/A"}
                </p>
                <p>
                  <strong>WhatsApp:</strong> {user.owner?.whatsapp || "N/A"}
                </p>
              </div>

              {/* GOV ID IMAGE */}
              <div className="mt-6">
                <p className="text-sm font-semibold mb-2">Government ID</p>
                {govIDImage ? (
                  <img
                    src={govIDImage}
                    alt="Government ID"
                    onClick={() => window.open(govIDImage, "_blank")}
                    className="h-48 w-full max-w-md object-cover rounded-xl border cursor-pointer"
                  />
                ) : (
                  <p className="text-gray-400 text-sm">
                    No government ID uploaded
                  </p>
                )}
              </div>

              {/* BIO */}
              {user.owner?.bio && (
                <p className="mt-4 text-gray-700 leading-relaxed">
                  <strong>Bio:</strong> {user.owner.bio}
                </p>
              )}

              {/* VERIFY OWNER BUTTON */}
              {!user.owner?.isVerified && (
                <button
                  onClick={handleVerifyOwner}
                  disabled={processing}
                  className="mt-6 bg-green-600 text-white px-6 py-2 rounded-xl"
                >
                  {processing ? "Processing..." : "Verify Owner"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold text-[#837ab6] mb-3">
              Account Actions
            </h3>

            <button
              onClick={handleToggleActive}
              disabled={processing}
              className={`w-full px-5 py-2 rounded-xl text-white ${
                user.isActive ? "bg-red-500" : "bg-green-600"
              }`}
            >
              {processing
                ? "Processing..."
                : user.isActive
                ? "Block User"
                : "Activate User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
