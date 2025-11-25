import express from "express";
import {
  beOwner,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUserRole,
} from "../controllers/userController.js";
import {
  authenticateUser,
  authorizeAdmin,
} from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
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
  beOwner
);

// for admin
router.get("/", authenticateUser, authorizeAdmin, getAllUsers);
router.get("/:id", authenticateUser, authorizeAdmin, getUserById);
router.put("/:id/role", authenticateUser, authorizeAdmin, updateUserRole);
router.delete("/:id", authenticateUser, authorizeAdmin, deleteUser);

export default router;
