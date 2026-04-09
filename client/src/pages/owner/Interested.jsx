import React, { useEffect, useState } from "react";
import { useAuth } from "../../store/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import socket from "../../utils/socket";

export default function Interested() {
  const { API, user } = useAuth();
  const navigate = useNavigate();
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    fetchInterests();
    
    // Listen for new messages
    const handleReceiveMessage = (newMsg) => {
      console.log("New message received:", newMsg);
      // Update unread count for the relevant interest
      updateUnreadCountForInterest(newMsg.chatId);
    };
    
    // Listen for message read status
    const handleMessageRead = ({ interestId }) => {
      setUnreadCounts(prev => ({
        ...prev,
        [interestId]: 0
      }));
    };
    
    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("messageRead", handleMessageRead);
    
    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messageRead", handleMessageRead);
    };
  }, []);

  // Update unread count for a specific interest
  const updateUnreadCountForInterest = async (interestId) => {
    try {
      const res = await fetch(`${API}/api/chat/${interestId}/unread`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setUnreadCounts(prev => ({
          ...prev,
          [interestId]: data.unreadCount || 0
        }));
      }
    } catch (err) {
      console.error("Error updating unread count:", err);
    }
  };

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
      
      // Fetch unread message counts for each interest
      await fetchUnreadCounts(sorted);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // FETCH UNREAD MESSAGE COUNTS
  // =============================
  const fetchUnreadCounts = async (interestsList) => {
    try {
      const counts = {};
      const fetchPromises = interestsList.map(async (interest) => {
        if (interest.status === "contacted") {
          try {
            const res = await fetch(
              `${API}/api/chat/${interest._id}/unread`,
              {
                credentials: "include",
              }
            );
            const data = await res.json();
            if (res.ok) {
              counts[interest._id] = data.unreadCount || 0;
            }
          } catch (err) {
            counts[interest._id] = 0;
          }
        } else {
          counts[interest._id] = 0;
        }
      });
      
      await Promise.all(fetchPromises);
      setUnreadCounts(counts);
    } catch (err) {
      console.error("Error fetching unread counts:", err);
    }
  };

  // =============================
  // MARK CONTACTED
  // =============================
  const markContacted = async (id) => {
    if (!window.confirm("Mark this user as contacted?")) return;

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
      // Remove unread count
      setUnreadCounts((prev) => {
        const newCounts = { ...prev };
        delete newCounts[id];
        return newCounts;
      });
    } catch (err) {
      alert(err.message);
    }
  };

  // =============================
  // OPEN CHAT WITH USER
  // =============================
  const openChat = (interest) => {
    // Mark messages as read when opening chat
    markMessagesAsRead(interest._id);
    // Navigate to chat page with the interest ID
    navigate(`/chat/${interest._id}`);
  };

  // =============================
  // MARK MESSAGES AS READ
  // =============================
  const markMessagesAsRead = async (interestId) => {
    try {
      await fetch(`${API}/api/chat/${interestId}/read`, {
        method: "POST",
        credentials: "include",
      });
      // Update unread count locally
      setUnreadCounts((prev) => ({
        ...prev,
        [interestId]: 0,
      }));
    } catch (err) {
      console.error("Error marking messages as read:", err);
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
      <div className="flex items-center justify-center min-h-screen bg-[#f6f4fa]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#837ab6] mx-auto mb-4"></div>
          <div className="text-gray-600">Loading interests...</div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f6f4fa]">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl shadow">
          Error: {error}
        </div>
      </div>
    );

  // =============================
  // UI
  // =============================
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6f4fa] to-[#e8e6f0] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#837ab6] to-[#6e65a3] bg-clip-text text-transparent">
            Interested Users Queue
          </h1>
          <p className="text-gray-500 mt-2">Manage and chat with interested users</p>
        </div>

        {interests.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No interests yet</h3>
            <p className="text-gray-500">When users show interest in your rooms, they'll appear here</p>
          </div>
        )}

        <div className="space-y-6">
          {Object.values(grouped).map((group) => (
            <div
              key={group.room?._id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* ROOM HEADER */}
              <div className="bg-gradient-to-r from-[#837ab6] to-[#9d85b6] px-6 py-4">
                <h2 className="text-xl font-bold text-white">
                  {group.room?.title || "Unknown Room"}
                </h2>
                {group.room?.contact && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white/80 text-sm">📞 {group.room.contact}</span>
                    <button
                      onClick={() => copyText(group.room.contact)}
                      className="text-xs bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                )}
              </div>

              {/* USERS QUEUE */}
              <div className="divide-y divide-gray-100">
                {group.list.map((i, index) => {
                  const isContacted = i.status === "contacted";
                  const unreadCount = unreadCounts[i._id] || 0;

                  const canMark =
                    index === 0 ||
                    group.list
                      .slice(0, index)
                      .every((prev) => prev.isDeleted);

                  return (
                    <div
                      key={i._id}
                      className={`p-5 transition-all duration-200 hover:bg-gray-50 ${
                        unreadCount > 0 ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        {/* USER INFO */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-bold text-lg text-[#837ab6]">
                              #{index + 1}
                            </span>
                            <h3 className="font-semibold text-gray-800">
                              {i.user?.name}
                            </h3>
                            {unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                                {unreadCount} new message
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {i.user?.email}
                          </p>
                          {i.message && (
                            <div className="mt-2 bg-purple-50 border-l-4 border-purple-400 p-2 rounded text-sm text-gray-700">
                              💬 "{i.message}"
                            </div>
                          )}
                        </div>

                        <div className="text-xs text-gray-400">
                          {new Date(i.createdAt).toLocaleDateString()} at{' '}
                          {new Date(i.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      {/* STATUS + ACTIONS */}
                      <div className="flex flex-wrap justify-between items-center gap-3 mt-4">
                        <div className="flex gap-2">
                          {isContacted ? (
                            <>
                              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                                ✓ Contacted
                              </span>
                              {/* Chat Button with unread badge */}
                              <button
                                onClick={() => openChat(i)}
                                className="relative bg-blue-500 hover:bg-blue-600 text-white px-5 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow"
                              >
                                💬 Chat
                                {unreadCount > 0 && (
                                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md animate-bounce">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                  </span>
                                )}
                              </button>
                            </>
                          ) : (
                            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                              ⏳ Pending
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {/* FIFO PROTECTED BUTTON */}
                          {!isContacted && (
                            <>
                              {canMark ? (
                                <button
                                  onClick={() => markContacted(i._id)}
                                  className="bg-[#837ab6] hover:bg-[#6e65a3] text-white px-5 py-1.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow"
                                >
                                  Mark Contacted
                                </button>
                              ) : (
                                <button
                                  disabled
                                  className="bg-gray-200 text-gray-500 px-5 py-1.5 rounded-lg cursor-not-allowed"
                                  title="Complete previous interests first"
                                >
                                  🔒 Waiting
                                </button>
                              )}
                            </>
                          )}

                          {/* DELETE */}
                          {isContacted ? (
                            <button
                              onClick={() => deleteInterest(i._id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow"
                            >
                              Delete
                            </button>
                          ) : (
                            <button
                              disabled
                              className="bg-gray-200 text-gray-500 px-4 py-1.5 rounded-lg cursor-not-allowed"
                            >
                              🔒 Locked
                            </button>
                          )}
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
    </div>
  );
}