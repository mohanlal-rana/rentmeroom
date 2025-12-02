import express from "express";
import {
  beOwner,
  deleteUser,
  getAllUsers,
  getUserById,
  verifyOwner,
} from "../controllers/userController.js";
import {
  authenticateUser,
  authorizeAdmin,
} from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import validate from "../middlewares/validateMiddleware.js";
import { ownerSchema } from "../validators/ownerValidator.js";
import fillFileNames from "../middlewares/fileMiddleware.js";
const router = express.Router();

router.get("/me", authenticateUser, async (req, res) => {
  res.status(200).json({ user: req.user });
});

//for owner
router.put(
  "/upgarde-to-owner",
  authenticateUser,
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "govIDImage", maxCount: 1 },
  ]),
  fillFileNames,
  validate(ownerSchema),

  beOwner
);

// for admin
router.get("/", authenticateUser, authorizeAdmin, getAllUsers);
router.put("/verify/:id", authenticateUser, authorizeAdmin, verifyOwner);
router.get("/:id", authenticateUser, authorizeAdmin, getUserById);
router.delete("/:id", authenticateUser, authorizeAdmin, deleteUser);

export default router;
