import { useState } from "react";
import { useAuth } from "../store/AuthContext.jsx";

const ProfilePage = () => {
  const { user, isLoading, fetchUserProfile, API } = useAuth();
  const [loadingRefresh, setLoadingRefresh] = useState(false);

  // Helper to get full image URL
  const getImageUrl = (filename) =>
    filename ? `${API}/uploads/${filename}` : null;

  // Refresh profile
  const handleRefresh = async () => {
    setLoadingRefresh(true);
    await fetchUserProfile();
    setLoadingRefresh(false);
  };

  if (isLoading)
    return (
      <div className="text-[#837ab6] text-center mt-20 text-xl font-semibold">
        Loading profile...
      </div>
    );

  if (!user)
    return (
      <div className="text-gray-500 text-center mt-20 text-lg">
        No user data found.
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f6f4fa] px-6 py-10">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-3xl font-bold text-[#837ab6]">My Profile</h1>
        <button
          onClick={handleRefresh}
          className="px-6 py-2 bg-[#837ab6] text-white rounded-xl hover:bg-[#9d85b6] transition font-semibold shadow-md active:scale-95 disabled:opacity-50"
          disabled={loadingRefresh}
        >
          {loadingRefresh ? "Refreshing..." : "Refresh Profile"}
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-start">
        {/* LEFT COLUMN: Basic Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition">
          <h2 className="text-2xl font-semibold text-[#837ab6] mb-4">
            Basic Info
          </h2>
          <div className="text-gray-700 space-y-2">
            <div>
              <strong>ID:</strong> {user._id}
            </div>
            <div>
              <strong>Name:</strong> {user.name}
            </div>
            <div>
              <strong>Email:</strong> {user.email}
            </div>
            <div>
              <strong>Role:</strong> {user.role}
            </div>
            <div>
              <strong>Active:</strong> {user.isActive ? "Yes ✅" : "No ❌"}
            </div>
            <div>
              <strong>Created At:</strong>{" "}
              {new Date(user.createdAt).toLocaleString()}
            </div>
            <div>
              <strong>Updated At:</strong>{" "}
              {new Date(user.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Owner Info */}
        {user.role === "owner" && user.owner && (
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition">
            <h2 className="text-2xl font-semibold text-[#837ab6] mb-4">
              Owner Info
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 text-gray-700">
              <p>
                <strong>Phone:</strong> {user.owner.phone || "-"}
              </p>
              <p>
                <strong>Address:</strong> {user.owner.address || "-"}
              </p>
              <p>
                <strong>Gov ID Type:</strong> {user.owner.govIDType || "-"}
              </p>
              <p>
                <strong>Gov ID Number:</strong> {user.owner.govIDNumber || "-"}
              </p>
              <p>
                <strong>Property Count:</strong> {user.owner.propertyCount}
              </p>
              <p>
                <strong>Facebook:</strong> {user.owner.facebook || "-"}
              </p>
              <p>
                <strong>WhatsApp:</strong> {user.owner.whatsapp || "-"}
              </p>
              <p>
                <strong>Bio:</strong> {user.owner.bio || "-"}
              </p>
              <p>
                <strong>Verified:</strong>{" "}
                {user.owner.isVerified ? "Yes ✅" : "No ❌"}
              </p>
            </div>

            {/* Images */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              {user.owner.profileImage && (
                <div className="flex-1">
                  <strong className="block text-sm mb-1">Profile Image:</strong>
                  <img
                    src={getImageUrl(user.owner.profileImage)}
                    alt="Profile"
                    className="w-full h-40 object-cover rounded-xl border cursor-pointer hover:opacity-80"
                    onClick={() =>
                      window.open(
                        getImageUrl(user.owner.profileImage),
                        "_blank",
                      )
                    }
                  />
                </div>
              )}
              {user.owner.govIDImage && (
                <div className="flex-1">
                  <strong className="block text-sm mb-1">Government ID:</strong>
                  <img
                    src={getImageUrl(user.owner.govIDImage)}
                    alt="Gov ID"
                    className="w-full h-40 object-cover rounded-lg border cursor-pointer hover:opacity-80"
                    onClick={() =>
                      window.open(getImageUrl(user.owner.govIDImage), "_blank")
                    }
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
