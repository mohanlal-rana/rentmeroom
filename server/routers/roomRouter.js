import express from "express";
import {
  addRoom,
  decreaseAvialableRoom,
  deleteRoom,
  deleteRoomByAdmin,
  getAdminRoomById,
  getAllOwnerRooms,
  getAllRoom,
  getOwnerRoomById,
  getRoom,
  getRoomById,
  getSavedRooms,
  increaseAvialableRoom,
  paymentslip,
  saveRoom,
  searchRooms,
  toggleRoomStatus,
  unsaveRoom,
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
import { parseFormData } from "../middlewares/parseFormData.js";

const router = express.Router();
//public route
router.get("/get", getRoom);
router.get("/get/:id", getRoomById);
router.get("/search", searchRooms);
//user route
router.put("/save/:id", authenticateUser, saveRoom);
router.put("/unsave/:id", authenticateUser, unsaveRoom);  
router.get("/saved", authenticateUser, getSavedRooms);
//owner route
router.post(
  "/",
  authenticateUser,
  authorizeOwner,
  upload.array("images", 5),
  parseFormData,
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
  parseFormData,
  validate(createRoomSchema),
  updateRoom
);

router.put("/:id/uplaod/paymentslip",authenticateUser,authorizeOwner,upload.single("slip"),paymentslip)
router.put("/:id/roomstatus", authenticateUser, authorizeOwner, toggleRoomStatus);
router.put("/:id/avialableroom/increase",authenticateUser,authorizeOwner,increaseAvialableRoom),
router.put("/:id/avialableroom/decrease",authenticateUser,authorizeOwner,decreaseAvialableRoom),
router.delete("/:id", authenticateUser, authorizeOwner, deleteRoom);

//admin route

router.get("/getAll", authenticateUser, authorizeAdmin, getAllRoom);
router.get("/getAll/:id", authenticateUser, authorizeAdmin, getAdminRoomById);
router.put("/verify/:id", authenticateUser, authorizeAdmin, verifyRoom);
router.delete("/admin/:id",authenticateUser,authorizeAdmin,deleteRoomByAdmin)

export default router;
