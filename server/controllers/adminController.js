import User from "../models/userModel.js";
import Room from "../models/roomModel.js";

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalOwners = await User.countDocuments({ role: "owner" });
    const totalRooms = await Room.countDocuments();
    const totalActiveUsers = await User.countDocuments({ isActive: true });

    // ✅ NEW STATS
    const pendingOwners = await User.countDocuments({
      role: "owner",
      "owner.isVerified": false,
    });

    const verifiedRooms = await Room.countDocuments({ isVerified: true });

    const pendingRooms = await Room.countDocuments({
      isVerified: false,
    });

    res.status(200).json({
      totalUsers,
      totalOwners,
      totalRooms,
      totalActiveUsers,
      pendingOwners,
      verifiedRooms,
      pendingRooms,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch admin stats",
      error: error.message,
    });
  }
};