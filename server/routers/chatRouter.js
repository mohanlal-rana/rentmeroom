import express from "express";
import { getMessages, getUnreadCount, markAsRead } from "../controllers/chatController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/:interestId", getMessages);
// Add these routes to your chatRouter.js

// Get unread message count for an interest
router.get("/:interestId/unread", authenticateUser, getUnreadCount);

// Mark messages as read
router.post("/:interestId/read", authenticateUser, markAsRead);

export default router;