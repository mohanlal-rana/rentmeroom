import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import socket from "../utils/socket";
import { useAuth } from "../store/AuthContext";

export default function ChatPage() {
    const { interestId } = useParams();
    const { user, API } = useAuth();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const chatContainerRef = useRef(null);
    const [roomInfo, setRoomInfo] = useState(null);
    const [error, setError] = useState(null);

    // Scroll only the chat container, not the whole page
    useEffect(() => {
        if (chatContainerRef.current) {
            const scrollHeight = chatContainerRef.current.scrollHeight;
            const clientHeight = chatContainerRef.current.clientHeight;
            chatContainerRef.current.scrollTop = scrollHeight - clientHeight;
        }
    }, [messages]);

    // Fetch messages and setup socket
    useEffect(() => {
        if (!user?._id || !interestId) {
            console.log("Missing user or interestId:", { userId: user?._id, interestId });
            setLoading(false);
            return;
        }

        console.log("Setting up chat for interestId:", interestId);
        
        let isMounted = true;
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 3;

        const fetchRoomInfo = async () => {
            try {
                const res = await fetch(`${API}/api/interested/${interestId}`, {
                    credentials: "include",
                });
                const data = await res.json();
                if (isMounted) {
                    if (res.ok && data.interest) {
                        setRoomInfo(data.interest.room);
                    } else if (res.status === 403) {
                        console.log("User is not the owner of this interest, skipping room info");
                        setRoomInfo({ title: "Chat Conversation" });
                    } else {
                        console.error("Failed to fetch room info:", data.message);
                        setRoomInfo({ title: "Chat Conversation" });
                    }
                }
            } catch (err) {
                console.error("Error fetching room info:", err);
                if (isMounted) {
                    setRoomInfo({ title: "Chat Conversation" });
                }
            }
        };

        // Fetch existing messages
        const fetchMessages = async () => {
            try {
                console.log("Fetching messages from:", `${API}/api/chat/${interestId}`);
                const res = await fetch(`${API}/api/chat/${interestId}`, {
                    credentials: "include",
                });
                const data = await res.json();
                console.log("Fetch response:", { ok: res.ok, data });

                if (!isMounted) return;

                if (res.ok) {
                    setMessages(data.messages || []);
                    console.log(`Loaded ${data.messages?.length || 0} messages`);
                    setError(null);
                } else {
                    console.error("Failed to fetch messages:", data.message);
                    setMessages([]);
                    setError(data.message || "Failed to load messages");
                }
            } catch (err) {
                console.error("Fetch history error:", err);
                if (isMounted) {
                    setMessages([]);
                    setError("Network error loading messages");
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        // Setup socket connection
        const setupSocket = () => {
            console.log("Setting up socket connection...");
            
            // Set auth data
            socket.auth = { userId: user._id, interestId: interestId };
            
            // Remove all existing listeners to avoid duplicates
            socket.off("connect");
            socket.off("connect_error");
            socket.off("disconnect");
            socket.off("receiveMessage");
            socket.off("error");
            
            // Add event listeners
            socket.on("connect", () => {
                console.log("✅ Socket connected successfully! ID:", socket.id);
                if (isMounted) {
                    setIsConnected(true);
                    setError(null);
                    console.log("Joining room:", interestId);
                    socket.emit("joinChat", interestId);
                    reconnectAttempts = 0;
                }
            });
            
            socket.on("connect_error", (err) => {
                console.error("❌ Socket connection error:", err.message);
                if (isMounted) {
                    setIsConnected(false);
                    if (reconnectAttempts < maxReconnectAttempts) {
                        reconnectAttempts++;
                        console.log(`Reconnect attempt ${reconnectAttempts}/${maxReconnectAttempts}`);
                        setTimeout(() => {
                            if (isMounted && !socket.connected) {
                                socket.connect();
                            }
                        }, 2000);
                    } else {
                        setError("Unable to connect to chat server. Please refresh the page.");
                    }
                }
            });
            
            socket.on("disconnect", (reason) => {
                console.log("🔌 Socket disconnected:", reason);
                if (isMounted) {
                    setIsConnected(false);
                    if (reason === "io server disconnect") {
                        socket.connect();
                    }
                }
            });
            
            socket.on("receiveMessage", (newMsg) => {
                console.log("📨 New message received:", newMsg);
                if (isMounted) {
                    setMessages((prev) => {
                        // Check for duplicate by ID
                        if (prev.some(msg => msg._id === newMsg._id)) {
                            return prev;
                        }
                        
                        // Add new message
                        return [...prev, newMsg];
                    });
                }
            });
            
            socket.on("error", (error) => {
                console.error("Socket error:", error);
                setSending(false);
                setError(error.message || "An error occurred");
                setTimeout(() => setError(null), 5000);
            });
            
            // Connect if not already connected
            if (!socket.connected) {
                console.log("Connecting socket...");
                socket.connect();
            } else {
                console.log("Socket already connected, joining room immediately");
                setIsConnected(true);
                socket.emit("joinChat", interestId);
            }
        };
        
        // Execute all fetch operations in parallel
        const initializeChat = async () => {
            await Promise.all([
                fetchRoomInfo(),
                fetchMessages()
            ]);
            setupSocket();
        };
        
        initializeChat();

        // Cleanup
        return () => {
            console.log("Cleaning up ChatPage");
            isMounted = false;
            socket.off("connect");
            socket.off("connect_error");
            socket.off("disconnect");
            socket.off("receiveMessage");
            socket.off("error");
        };
    }, [interestId, user?._id, API]);

    const sendMessage = (e) => {
        // Prevent default form submission
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        console.log("Send button clicked", { text, isConnected, socketConnected: socket.connected });
        
        if (!text.trim()) {
            console.log("Message is empty");
            return;
        }

        if (!socket.connected) {
            console.error("Socket not connected!");
            alert("Not connected to chat server. Please wait or refresh the page.");
            return;
        }

        if (sending) {
            console.log("Already sending a message, please wait");
            return;
        }

        setSending(true);
        const messageText = text.trim();
        
        const msgData = {
            chatId: interestId,
            senderId: user._id,
            text: messageText
        };

        console.log("Sending message:", msgData);
        
        // Clear input immediately
        setText("");
        
        // Send the message - NO optimistic message, just send and wait for server response
        socket.emit("sendMessage", msgData);
        
        // Reset sending state after a short delay
        setTimeout(() => {
            setSending(false);
        }, 1000);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(e);
        }
    };

    const retryConnection = () => {
        setLoading(true);
        setError(null);
        if (socket.disconnected) {
            socket.connect();
        }
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#f6f4fa]">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                    <div className="text-4xl mb-4 animate-pulse">💬</div>
                    <div className="text-gray-600">Loading chat...</div>
                    <div className="text-xs text-gray-400 mt-2">Please wait</div>
                </div>
            </div>
        );
    }

    if (error && messages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#f6f4fa]">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
                    <div className="text-4xl mb-4">⚠️</div>
                    <div className="text-red-600 mb-4">{error}</div>
                    <button
                        onClick={retryConnection}
                        className="px-6 py-2 bg-[#837ab6] text-white rounded-lg hover:bg-[#6e65a3]"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full max-h-[500px] bg-[#f6f4fa] rounded-lg shadow-lg">
            {/* Header - Smaller */}
            <div className="bg-white shadow-sm px-4 py-2 rounded-t-lg border-b">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-sm font-semibold text-[#837ab6]">
                            💬 {roomInfo?.title || "Conversation"}
                        </h2>
                        {roomInfo?.contact && (
                            <p className="text-[10px] text-gray-500">
                                📞 {roomInfo.contact}
                            </p>
                        )}
                    </div>
                    <div className={`text-[9px] px-2 py-0.5 rounded-full ${
                        isConnected ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                        {isConnected ? '● Connected' : '○ Disconnected'}
                    </div>
                </div>
            </div>

            {/* Chat History Area - Fixed height with scroll */}
            <div 
                ref={chatContainerRef}
                className="h-[50vh] overflow-y-auto p-2 space-y-1.5 bg-[#f6f4fa]"
            >
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 text-xs mt-10">
                        No messages yet. Start the conversation!
                    </div>
                )}
                {messages.map((m, idx) => {
                    const isMyMessage = m.senderId === user._id || m.senderId?._id === user._id;
                    
                    return (
                        <div
                            key={m._id || idx}
                            className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] px-2 py-1 rounded-lg shadow-sm ${
                                isMyMessage
                                    ? "bg-[#837ab6] text-white rounded-tr-none"
                                    : "bg-white text-gray-800 rounded-tl-none"
                            }`}>
                                {!isMyMessage && (
                                    <div className="text-[9px] font-semibold mb-0.5 text-[#837ab6]">
                                        {m.senderId?.name || "User"}
                                    </div>
                                )}
                                <p className="text-xs">{m.text}</p>
                                <div className={`text-[8px] mt-0.5 text-right ${
                                    isMyMessage ? 'text-white/70' : 'text-gray-400'
                                }`}>
                                    {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    }) : ""}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input Area - Smaller */}
            <div className="bg-white border-t px-3 py-2 rounded-b-lg">
                <form onSubmit={sendMessage} className="flex gap-2 items-center">
                    <input
                        type="text"
                        value={text}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={isConnected ? "Type a message..." : "Connecting..."}
                        disabled={!isConnected || sending}
                        className="flex-1 px-2 py-1 text-xs rounded-full border border-gray-300 text-gray-700 outline-none focus:border-[#837ab6] focus:ring-1 focus:ring-[#837ab6] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <button
                        type="submit"
                        onClick={sendMessage}
                        disabled={!text.trim() || !isConnected || sending}
                        className="px-3 py-1 text-xs rounded-full bg-[#837ab6] text-white font-medium hover:bg-[#6e65a3] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}