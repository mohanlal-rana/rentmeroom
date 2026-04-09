import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../../utils/socket";
import { useAuth } from "../../store/AuthContext";

export default function OwnerChatPage() {
    const { interestId } = useParams();
    const { user, API } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [interestInfo, setInterestInfo] = useState(null);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const isMountedRef = useRef(true);

    // Scroll only the chat container, not the whole page
    useEffect(() => {
        if (messagesEndRef.current && chatContainerRef.current) {
            const scrollHeight = chatContainerRef.current.scrollHeight;
            const clientHeight = chatContainerRef.current.clientHeight;
            chatContainerRef.current.scrollTop = scrollHeight - clientHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (!user?._id || !interestId) {
            console.log("Missing user or interestId");
            setLoading(false);
            return;
        }

        isMountedRef.current = true;

        // Fetch interest and user info
        const fetchInterestInfo = async () => {
            try {
                console.log("Fetching interest info for:", interestId);
                const res = await fetch(`${API}/api/interested/${interestId}`, {
                    credentials: "include",
                });
                const data = await res.json();
                console.log("Interest info response:", data);
                if (isMountedRef.current && res.ok) {
                    setInterestInfo(data.interest);
                } else if (!res.ok && isMountedRef.current) {
                    console.error("Failed to fetch interest:", data.message);
                    setInterestInfo({
                        user: { name: "User" },
                        room: { title: "Chat" }
                    });
                }
            } catch (err) {
                console.error("Error fetching interest info:", err);
                if (isMountedRef.current) {
                    setInterestInfo({
                        user: { name: "User" },
                        room: { title: "Chat" }
                    });
                }
            }
        };

        // Fetch messages
        const fetchMessages = async () => {
            try {
                console.log("Fetching messages for interestId:", interestId);
                const res = await fetch(`${API}/api/chat/${interestId}`, {
                    credentials: "include",
                });
                const data = await res.json();
                console.log("Messages response:", data);
                if (isMountedRef.current && res.ok) {
                    setMessages(data.messages || []);
                    console.log(`Loaded ${data.messages?.length || 0} messages`);
                } else if (isMountedRef.current) {
                    console.error("Failed to fetch messages:", data.message);
                    setMessages([]);
                }
            } catch (err) {
                console.error("Error fetching messages:", err);
                if (isMountedRef.current) {
                    setMessages([]);
                }
            } finally {
                if (isMountedRef.current) {
                    setLoading(false);
                }
            }
        };

        // Setup socket
        const setupSocket = () => {
            console.log("Setting up socket connection for owner");
            socket.auth = { userId: user._id, interestId: interestId };
            
            // Remove existing listeners
            socket.off("connect");
            socket.off("connect_error");
            socket.off("disconnect");
            socket.off("receiveMessage");
            
            socket.on("connect", () => {
                console.log("✅ Socket connected as owner");
                if (isMountedRef.current) {
                    setIsConnected(true);
                    setError(null);
                    socket.emit("joinChat", interestId);
                }
            });
            
            socket.on("connect_error", (err) => {
                console.error("❌ Socket error:", err.message);
                if (isMountedRef.current) {
                    setIsConnected(false);
                    setError("Connection error: " + err.message);
                }
            });
            
            socket.on("disconnect", () => {
                console.log("Socket disconnected");
                if (isMountedRef.current) {
                    setIsConnected(false);
                }
            });
            
            socket.on("receiveMessage", (newMsg) => {
                console.log("📨 New message received:", newMsg);
                if (isMountedRef.current) {
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
            
            // Connect if not already connected
            if (!socket.connected) {
                console.log("Connecting socket...");
                socket.connect();
            } else {
                console.log("Socket already connected");
                setIsConnected(true);
                socket.emit("joinChat", interestId);
            }
        };
        
        // Execute sequentially
        const initializeChat = async () => {
            await fetchInterestInfo();
            await fetchMessages();
            setupSocket();
        };
        
        initializeChat();

        // Cleanup
        return () => {
            console.log("Cleaning up OwnerChatPage");
            isMountedRef.current = false;
            socket.off("connect");
            socket.off("connect_error");
            socket.off("disconnect");
            socket.off("receiveMessage");
        };
    }, [interestId, user?._id, API]);

    const sendMessage = (e) => {
        // Prevent default form submission and page scroll
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        if (!text.trim()) {
            console.log("Empty message");
            return;
        }

        if (!socket.connected) {
            console.error("Socket not connected!");
            alert("Not connected to chat. Please wait or refresh.");
            return;
        }

        if (sending) {
            console.log("Already sending a message");
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
        
        // Send the message - NO optimistic message
        socket.emit("sendMessage", msgData);
        
        // Reset sending state after a short delay
        setTimeout(() => {
            setSending(false);
        }, 1000);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault(); // Prevent form submission on Enter
            sendMessage(e);
        }
    };

    const handleRetry = () => {
        setLoading(true);
        setError(null);
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#f6f4fa]">
                <div className="text-center">
                    <div className="text-4xl mb-4 animate-pulse">💬</div>
                    <div className="text-gray-600">Loading chat...</div>
                    <div className="text-xs text-gray-400 mt-2">Please wait</div>
                </div>
            </div>
        );
    }

    if (error && messages.length === 0) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#f6f4fa]">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
                    <div className="text-4xl mb-4">⚠️</div>
                    <div className="text-red-600 mb-4">{error}</div>
                    <button
                        onClick={handleRetry}
                        className="px-6 py-2 bg-[#837ab6] text-white rounded-lg hover:bg-[#6e65a3]"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full max-h-[500px] bg-[#f6f4fa] rounded-lg shadow-lg">
            {/* Header - Compact */}
            <div className="bg-white shadow-sm px-4 py-2 rounded-t-lg border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => navigate(-1)}
                            className="text-gray-600 hover:text-gray-800 text-lg leading-none font-bold"
                            type="button"
                        >
                            ←
                        </button>
                        <div>
                            <h2 className="text-sm font-semibold text-[#837ab6]">
                                💬 {interestInfo?.user?.name || "User"}
                            </h2>
                            <p className="text-[10px] text-gray-500">
                                {interestInfo?.room?.title || "Unknown Room"}
                            </p>
                            {interestInfo?.user?.email && (
                                <p className="text-[9px] text-gray-400">
                                    {interestInfo.user.email}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className={`text-[9px] px-2 py-0.5 rounded-full ${
                        isConnected ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                        {isConnected ? '● Connected' : '○ Disconnected'}
                    </div>
                </div>
            </div>

            {/* Messages - Fixed height with scroll */}
            <div 
                ref={chatContainerRef}
                className="h-[300px] overflow-y-auto p-2 space-y-1.5 bg-[#f6f4fa]"
            >
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 text-xs mt-10">
                        No messages yet. Start the conversation!
                    </div>
                )}
                {messages.map((msg, idx) => {
                    const isMyMessage = msg.senderId === user._id || msg.senderId?._id === user._id;
                    
                    return (
                        <div
                            key={msg._id || idx}
                            className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] px-2 py-1 rounded-lg shadow-sm ${
                                isMyMessage
                                    ? 'bg-[#837ab6] text-white rounded-tr-none'
                                    : 'bg-white text-gray-800 rounded-tl-none'
                            }`}>
                                {!isMyMessage && (
                                    <div className="text-[9px] font-semibold mb-0.5 text-[#837ab6]">
                                        {msg.senderId?.name || "User"}
                                    </div>
                                )}
                                <p className="text-xs">{msg.text}</p>
                                <div className={`text-[8px] mt-0.5 text-right ${
                                    isMyMessage ? 'text-white/70' : 'text-gray-400'
                                }`}>
                                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }) : ''}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input - Compact */}
            <div className="bg-white border-t px-3 py-2 rounded-b-lg">
                <form onSubmit={sendMessage} className="flex gap-2">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isConnected ? "Type a message..." : "Connecting..."}
                        disabled={!isConnected || sending}
                        className="flex-1 px-2 py-1 text-xs rounded-full border border-gray-300 text-gray-700 outline-none focus:border-[#837ab6] focus:ring-1 focus:ring-[#837ab6] disabled:bg-gray-100"
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