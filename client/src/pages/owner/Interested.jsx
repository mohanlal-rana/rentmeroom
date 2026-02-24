import React, { useEffect, useState } from "react";
import { useAuth } from "../../store/AuthContext.jsx";

export default function Interested() {
  const { API } = useAuth();

  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInterests();
  }, []);

  // =============================
  // FETCH INTERESTS
  // =============================
  const fetchInterests = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API}/api/interested/owner/interests`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      // Sort FIFO
      const sorted = data.interests.sort(
        (a, b) =>
          new Date(a.createdAt) - new Date(b.createdAt)
      );

      setInterests(sorted);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // MARK CONTACTED
  // =============================
  const markContacted = async (id) => {
    if (!window.confirm("Mark this user as contacted?"))
      return;

    try {
      const res = await fetch(
        `${API}/api/interested/owner/interests/${id}/contacted`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      // Refresh
      fetchInterests();
    } catch (err) {
      alert(err.message);
    }
  };

  // =============================
  // DELETE INTEREST
  // =============================
  const deleteInterest = async (id) => {
    if (!window.confirm("Delete permanently?")) return;

    try {
      const res = await fetch(
        `${API}/api/interested/owner/interests/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      // Remove locally
      setInterests((prev) =>
        prev.filter((item) => item._id !== id)
      );
    } catch (err) {
      alert(err.message);
    }
  };

  // =============================
  // COPY CONTACT
  // =============================
  const copyText = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard");
  };

  // =============================
  // GROUP BY ROOM
  // =============================
  const grouped = interests.reduce((acc, item) => {
    const roomId = item.room?._id || "unknown";

    if (!acc[roomId]) {
      acc[roomId] = {
        room: item.room,
        list: [],
      };
    }

    acc[roomId].list.push(item);
    return acc;
  }, {});

  // =============================
  // LOADING / ERROR
  // =============================
  if (loading)
    return (
      <div className="p-6 text-center">
        Loading interests...
      </div>
    );

  if (error)
    return (
      <div className="p-6 text-red-600">
        Error: {error}
      </div>
    );

  // =============================
  // UI
  // =============================
  return (
    <div className="min-h-screen bg-[#f6f4fa] p-6">
      <h1 className="text-2xl font-bold text-[#837ab6] mb-6">
        Interested Users Queue
      </h1>

      {interests.length === 0 && (
        <div className="bg-white p-6 rounded-xl shadow text-center">
          No one has shown interest yet 😔
        </div>
      )}

      <div className="space-y-8">
        {Object.values(grouped).map((group) => (
          <div
            key={group.room?._id}
            className="bg-white p-5 rounded-xl shadow"
          >
            {/* ROOM HEADER */}
            <div className="border-b pb-3 mb-4">
              <h2 className="text-xl font-bold text-[#837ab6]">
                {group.room?.title}
              </h2>

              {group.room?.contact && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>
                    Owner Contact: {group.room.contact}
                  </span>

                  <button
                    onClick={() =>
                      copyText(group.room.contact)
                    }
                    className="text-xs bg-gray-100 px-2 rounded"
                  >
                    Copy
                  </button>
                </div>
              )}
            </div>

            {/* USERS QUEUE */}
            <div className="space-y-4">
              {group.list.map((i, index) => {
                const isContacted =
                  i.status === "contacted";

                // ✅ STRICT RULE:
                // Previous MUST be deleted.
                const canMark =
                  index === 0 ||
                  group.list
                    .slice(0, index)
                    .every((prev) => prev.isDeleted);

                return (
                  <div
                    key={i._id}
                    className="border rounded-lg p-4 bg-[#faf9ff]"
                  >
                    {/* USER INFO */}
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold">
                          #{index + 1} —{" "}
                          {i.user?.name}
                        </p>
                        <p className="text-sm">
                          {i.user?.email}
                        </p>
                      </div>

                      <span className="text-xs text-gray-400">
                        {new Date(
                          i.createdAt
                        ).toLocaleString()}
                      </span>
                    </div>

                    {/* MESSAGE */}
                    {i.message && (
                      <div className="bg-purple-50 p-2 rounded text-sm mt-2">
                        Message: {i.message}
                      </div>
                    )}

                    {/* STATUS + ACTIONS */}
                    <div className="flex justify-between items-center mt-3">
                      {isContacted ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                          Contacted ✓
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                          Pending
                        </span>
                      )}

                      <div className="flex gap-2">
                        {/* FIFO PROTECTED BUTTON */}
                        {!isContacted && (
                          <>
                            {canMark ? (
                              <button
                                onClick={() =>
                                  markContacted(i._id)
                                }
                                className="bg-[#837ab6] text-white px-4 py-1 rounded-lg hover:bg-[#9d85b6]"
                              >
                                Mark Contacted
                              </button>
                            ) : (
                              <button
                                disabled
                                className="bg-gray-300 text-gray-500 px-4 py-1 rounded-lg cursor-not-allowed"
                              >
                                Waiting For Previous
                              </button>
                            )}
                          </>
                        )}

                        {/* DELETE */}
                        <button
                          onClick={() =>
                            deleteInterest(i._id)
                          }
                          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}