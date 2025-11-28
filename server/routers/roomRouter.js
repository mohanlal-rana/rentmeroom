import express from "express";
import { addRoom } from "../controllers/roomController.js";
import {
  authenticateUser,
  authorizeOwner,
} from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import { createRoomSchema } from "../validators/roomValidator.js";
import validate from "../middlewares/validateMiddleware.js";

const router = express.Router();

router.post(
  "/add",
  authenticateUser,
  authorizeOwner,
  upload.array("images", 5),
  validate(createRoomSchema),
  addRoom
);

export default router;
