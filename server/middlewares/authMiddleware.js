import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const authenticateUser = async (req, res, next) => {
  console.log("Authenticating user...");
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "cannot authenticate user" });
    }
    const token = authHeader.split(" ")[1].trim();
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const userId = decoded.userId || decoded.id;

    if (!userId) {
      return res.status(401).json({ message: "cannot authenticate user" });
    }
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "user not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "internal server error" });
  }
};

export const authorizeOwner = (req, res, next) => {
  if (req.user?.role === "owner" && req.user?.owner.isVerified) return next();
  res.status(403).json({ message: "Access denied. owner is only allowed" });
};

export const authorizeAdmin = (req, res, next) => {
  if (req.user?.role === "admin") return next();
  res.status(403).json({ message: "Access denied. Admins is only allowed." });
};
