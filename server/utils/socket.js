// utils/socket.js (backend)
import { Server } from "socket.io";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";

export function initSocket(server, allowedOrigins = []) {
  const io = new Server(server, {
    cors: { 
      origin: allowedOrigins, 
      credentials: true,
      methods: ["GET", "POST"]
    },
    allowEIO3: true // For compatibility
  });

  // Add middleware for debugging
  io.use((socket, next) => {
    console.log("Socket middleware - Auth:", socket.handshake.auth);
    next();
  });

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);
    console.log("Auth data:", socket.handshake.auth);

    // Join a room
    socket.on("joinChat", (interestId) => {
      console.log(`📌 User ${socket.id} joining room: ${interestId}`);
      socket.join(interestId);
      socket.emit("joined", { interestId }); // Acknowledge join
    });

    // Listen for messages
// utils/socket.js (backend)
socket.on("sendMessage", async (msg) => {
  console.log("📤 Received message:", msg);
  console.log("From socket:", socket.id);

  try {
    // Validate message
    if (!msg.chatId || !msg.senderId || !msg.text) {
      console.error("Invalid message format:", msg);
      socket.emit("error", { message: "Invalid message format" });
      return;
    }

    // Ensure chat exists
    let chat = await Chat.findOne({ interestId: msg.chatId });
    if (!chat) {
      console.log("Creating new chat for interestId:", msg.chatId);
      chat = await Chat.create({ 
        interestId: msg.chatId, 
        participants: [msg.senderId] 
      });
    } else if (!chat.participants.includes(msg.senderId)) {
      chat.participants.push(msg.senderId);
      await chat.save();
    }

    // Save message
    const newMsg = await Message.create({
      chatId: chat._id,
      senderId: msg.senderId,
      text: msg.text,
    });

    // Populate sender info
    const populatedMsg = await Message.findById(newMsg._id)
      .populate("senderId", "name email");

    console.log("✅ Message saved, broadcasting to room:", msg.chatId);
    
    // Broadcast to room
    io.to(msg.chatId).emit("receiveMessage", populatedMsg);
    
    // Send acknowledgment to sender
    socket.emit("messageSent", { success: true, message: populatedMsg });

  } catch (err) {
    console.error("❌ Error saving message:", err);
    socket.emit("error", { message: "Failed to send message" });
  }
});

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });

  return io;
}