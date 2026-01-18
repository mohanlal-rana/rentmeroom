import express from "express";
import {
  authenticateUser,
  authorizeOwner,
} from "../middlewares/authMiddleware.js";
import {
  getInterestedRooms,
  markInterested,
  markAsContacted,
  getAllInterestsForOwner,
  deleteInterest,
} from "../controllers/interestedController.js";

const router = express.Router();

// User routes
router.get("/", authenticateUser, getInterestedRooms);
router.post("/", authenticateUser, markInterested);

// Owner routes

// Owner: see all interests for their rooms
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

export default router;
