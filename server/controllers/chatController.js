// chatController.js
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";

// GET messages for a chat
export const getMessages = async (req, res) => {
  try {
    const { interestId } = req.params;
    
    let chat = await Chat.findOne({ interestId });
    
    if (!chat) {
      return res.status(200).json({ messages: [] });
    }

    const messages = await Message.find({ chatId: chat._id })
      .sort({ timestamp: 1 })
      .populate("senderId", "name email");

    res.json({ messages });
  } catch (err) {
    console.error("Error in getMessages:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get unread message count for an interest
export const getUnreadCount = async (req, res) => {
  try {
    const { interestId } = req.params;
    
    console.log("Getting unread count for interest:", interestId);
    console.log("User ID:", req.user._id);
    
    // Find chat by interestId
    const chat = await Chat.findOne({ interestId });
    
    if (!chat) {
      console.log("No chat found for interest:", interestId);
      return res.status(200).json({ unreadCount: 0 });
    }
    
    console.log("Found chat:", chat._id);
    
    // Count unread messages (messages not sent by current user and not read)
    const unreadCount = await Message.countDocuments({
      chatId: chat._id,
      senderId: { $ne: req.user._id },
      isRead: { $ne: true }
    });
    
    console.log("Unread count:", unreadCount);
    
    res.json({ unreadCount });
  } catch (err) {
    console.error("Error getting unread count:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const { interestId } = req.params;
    
    console.log("Marking messages as read for interest:", interestId);
    
    // Find chat by interestId
    const chat = await Chat.findOne({ interestId });
    
    if (!chat) {
      return res.status(200).json({ message: "No chat found" });
    }
    
    // Update all messages not sent by current user to read
    const result = await Message.updateMany(
      {
        chatId: chat._id,
        senderId: { $ne: req.user._id },
        isRead: { $ne: true }
      },
      { isRead: true }
    );
    
    console.log(`Marked ${result.modifiedCount} messages as read`);
    
    res.json({ message: "Messages marked as read", count: result.modifiedCount });
  } catch (err) {
    console.error("Error marking messages as read:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};