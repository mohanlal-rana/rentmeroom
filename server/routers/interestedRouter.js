import express from "express";
import { authenticateUser } from "../middlewares/authMiddleware.js";
import { getInterestedRooms, markInterested } from "../controllers/interestedController.js";

const router = express.Router();

// Example route for interestedRouter
router.get("/",authenticateUser,getInterestedRooms)

router.post("/",authenticateUser,markInterested)
export default router;