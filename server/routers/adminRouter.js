import express from "express";
import { getAdminStats } from "../controllers/adminController.js";
import {
  authenticateUser,
  authorizeAdmin,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin stats route
router.get("/stats", authenticateUser, authorizeAdmin, getAdminStats);

export default router;