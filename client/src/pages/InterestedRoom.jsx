import React, { useEffect, useState } from "react";
import { useAuth } from "../store/AuthContext";
import { useNavigate } from "react-router-dom";
import socket from "../utils/socket";

export default function InterestedRoom() {
  const { API, user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    fetchRooms();
    
    // Listen for new messages to update unread counts in real-time
    const handleReceiveMessage = (newMsg) => {
      updateUnreadCountForInterest(newMsg.chatId);
    };
    
    socket.on("receiveMessage", handleReceiveMessage);
    
    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
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

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/interested/`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setRooms(data.interestedRooms);
      
      // Fetch unread counts for contacted rooms
      await fetchUnreadCounts(data.interestedRooms);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread message counts
  const fetchUnreadCounts = async (roomsList) => {
    try {
      const counts = {};
      const fetchPromises = roomsList.map(async (interest) => {
        if (interest.status === "contacted") {
          try {
            const res = await fetch(`${API}/api/chat/${interest._id}/unread`, {
              credentials: "include",
            });
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

  const goToRoom = (roomId) => {
    navigate(`/rooms/${roomId}`);
  };

  const openChat = (interest) => {
    // Mark messages as read when opening chat
    markMessagesAsRead(interest._id);
    navigate(`/chat/${interest._id}`);
  };

  // Mark messages as read
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

  const copyText = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f6f4fa]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#837ab6] mx-auto mb-4"></div>
          <div className="text-gray-600">Loading your interested rooms...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f6f4fa]">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl shadow">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6f4fa] to-[#e8e6f0] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#837ab6] to-[#6e65a3] bg-clip-text text-transparent">
            My Interested Rooms
          </h1>
          <p className="text-gray-500 mt-2">Rooms you've shown interest in</p>
        </div>

        {rooms.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No interested rooms yet</h3>
            <p className="text-gray-500">Browse rooms and click "Interested" to get started</p>
            <button
              onClick={() => navigate("/rooms")}
              className="mt-4 bg-[#837ab6] text-white px-6 py-2 rounded-lg hover:bg-[#6e65a3] transition-colors"
            >
              Browse Rooms
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {rooms.map((i) => {
            const isContacted = i.status === "contacted";
            const unreadCount = unreadCounts[i._id] || 0;

            return (
              <div
                key={i._id}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${
                  unreadCount > 0 ? 'ring-2 ring-blue-400 shadow-blue-100' : ''
                }`}
              >
                {/* Room Header */}
                <div className="bg-gradient-to-r from-[#837ab6] to-[#9d85b6] p-5">
                  <h2 className="font-bold text-xl text-white mb-2">
                    {i.room?.title || "Unknown Room"}
                  </h2>
                  {i.room?.contact && (
                    <div className="flex items-center gap-2">
                      <span className="text-white/80 text-sm">📞 {i.room.contact}</span>
                      <button
                        onClick={() => copyText(i.room.contact)}
                        className="text-xs bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  )}
                  {i.room?.location?.coordinates && (
                    <p className="text-white/60 text-xs mt-1">
                      📍 {i.room.location.coordinates.join(", ")}
                    </p>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  {/* Status */}
                  <div className="flex items-center justify-between">
                    {isContacted ? (
                      <div className="flex items-center gap-2">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                          ✓ Owner Contacted
                        </span>
                        {unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                            {unreadCount} new message{unreadCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                          ⏳ Pending
                        </span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                          Queue: #{i.queuePosition}
                        </span>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-400">
                      {new Date(i.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Queue Position (for pending) */}
                  {!isContacted && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {i.queuePosition}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-800">Position in Queue</p>
                          <p className="text-xs text-blue-600">
                            {i.queuePosition === 1 
                              ? "You're next in line! The owner will contact you soon."
                              : `There are ${i.queuePosition - 1} person(s) ahead of you.`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-2">
                    <button
                      onClick={() => goToRoom(i.room?._id)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl transition-all duration-200 font-medium"
                    >
                      View Room Details
                    </button>

                    {isContacted && (
                      <button
                        onClick={() => openChat(i)}
                        className="relative w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        💬 Chat with Owner
                        {unreadCount > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg animate-bounce">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Timestamp */}
                  <p className="text-xs text-gray-400 text-center pt-2 border-t">
                    Interested on: {new Date(i.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}