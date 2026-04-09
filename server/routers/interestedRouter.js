import express from "express";
import {
  authenticateUser,
  authorizeAdmin,
  authorizeOwner,
} from "../middlewares/authMiddleware.js";
import {
  getInterestedRooms,
  markInterested,
  markAsContacted,
  getAllInterestsForOwner,
  deleteInterest,
  getAllInterestsForAdmin,
  updateInterestStatus,
  getInterestById,  // Add this import
} from "../controllers/interestedController.js";

const router = express.Router();

// User routes
router.get("/", authenticateUser, getInterestedRooms);
router.post("/", authenticateUser, markInterested);

// Owner routes
router.get(
  "/owner/interests",
  authenticateUser,
  authorizeOwner,
  getAllInterestsForOwner
);
router.delete(
  "/owner/interests/:interestId",
  authenticateUser,
  authorizeOwner,
  deleteInterest
);
router.put(
  "/owner/interests/:interestId/contacted",
  authenticateUser,
  authorizeOwner,
  markAsContacted
);

//admin
router.get("/admin/interests", authenticateUser,authorizeAdmin, getAllInterestsForAdmin);
router.patch("/admin/interests/:id", authenticateUser,authorizeAdmin, updateInterestStatus);

// Get single interest by ID (for chat)
router.get("/:interestId", authenticateUser, getInterestById);


export default router;