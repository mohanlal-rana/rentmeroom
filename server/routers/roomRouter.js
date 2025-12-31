import express from "express";
import {
  addRoom,
  deleteRoom,
  getAllOwnerRooms,
  getAllRoom,
  getOwnerRoomById,
  getRoom,
  getRoomById,
  updateRoom,
  verifyRoom,
} from "../controllers/roomController.js";
import {
  authenticateUser,
  authorizeAdmin,
  authorizeOwner,
} from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import { createRoomSchema } from "../validators/roomValidator.js";
import validate from "../middlewares/validateMiddleware.js";

const router = express.Router();
//public route
router.get("/get", getRoom);
router.get("/get/:id", getRoomById);
//owner route
router.post(
  "/add",
  authenticateUser,
  authorizeOwner,
  upload.array("images", 5),
  validate(createRoomSchema),
  addRoom
);
router.get("/owner/rooms", authenticateUser, authorizeOwner, getAllOwnerRooms);

router.get(
  "/owner/rooms/:id",
  authenticateUser,
  authorizeOwner,
  getOwnerRoomById
);

router.put(
  "/:id",
  authenticateUser,
  authorizeOwner,
  upload.array("images", 5),
  validate(createRoomSchema),
  updateRoom
);
router.delete("/:id", authenticateUser, authorizeOwner, deleteRoom);

//admin route

router.get("/getAll", authenticateUser, authorizeAdmin, getAllRoom);
router.put("/verify/:id", authenticateUser, authorizeAdmin, verifyRoom);

export default router;
