import Interested from "../models/interestedMOdel.js";
import Room from "../models/roomModel.js";
import mongoose from "mongoose";

// User marks interest
export const markInterested = async (req, res) => {
  try {
    const { roomId, message } = req.body;

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid room ID" });
    }

    const room = await Room.findById(roomId);
    if (!room || !room.isVerified) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found or not verified" });
    }

    const alreadyInterested = await Interested.findOne({
      user: req.user._id,
      room: roomId,
    });
    if (alreadyInterested) {
      return res
        .status(400)
        .json({
          success: false,
          message: "You have already marked interest for this room",
        });
    }

    const interested = new Interested({
      user: req.user._id,
      room: roomId,
      message,
    });
    await interested.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Interest marked successfully",
        interested,
      });
  } catch (error) {
    console.error("Error marking interest:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error: Unable to mark interest",
      });
  }
};

// User fetches their interested rooms
export const getInterestedRooms = async (req, res) => {
  try {
    const interests = await Interested.find({ user: req.user._id })
      .populate("room", "title price location contact")
      .sort({ createdAt: -1 });

    // filter out interests where room was deleted
    const filtered = interests.filter(i => i.room !== null);

    const result = filtered.map(i => ({
      _id: i._id,
      status: i.status,
      message: i.message,
      createdAt: i.createdAt,
      room: {
        _id: i.room._id,
        title: i.room.title,
        price: i.room.price,
        location: i.room.location,
        contact: i.status === "contacted" ? i.room.contact : null,
      },
    }));

    res.status(200).json({
      success: true,
      interestedRooms: result,
    });
  } catch (error) {
    console.error("Error fetching interested rooms:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Owner marks an interest as contacted
export const markAsContacted = async (req, res) => {
  try {
    const { interestId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(interestId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid interest ID" });
    }

    const interest = await Interested.findById(interestId).populate(
      "room",
      "owner title"
    );
    if (!interest) {
      return res
        .status(404)
        .json({ success: false, message: "Interest not found" });
    }

    // Only room owner can mark as contacted
    if (interest.room.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    interest.status = "contacted";
    await interest.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Interest marked as contacted",
        interest,
      });
  } catch (error) {
    console.error("Error marking interest as contacted:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error: Unable to update interest",
      });
  }
};

export const getAllInterestsForOwner = async (req, res) => {
  try {
    const ownerId = req.user._id;

    // Find all interests for rooms owned by this user
    const interests = await Interested.find()
      .populate({
        path: "room",
        match: { owner: ownerId }, // only rooms owned by this user
        select: "title price location contact owner",
      })
      .populate("user", "name email") // user info who marked interest
      .sort({ createdAt: -1 });

    // Filter out interests where room is null (not owned by this owner)
    const filtered = interests.filter(i => i.room !== null);

    const result = filtered.map(i => ({
      _id: i._id,
      status: i.status,
      message: i.message,
      createdAt: i.createdAt,
      user: i.user, // user info
      room: {
        _id: i.room._id,
        title: i.room.title,
        price: i.room.price,
        location: i.room.location,
        contact: i.status === "contacted" ? i.room.contact : null, // only if contacted
      },
    }));

    res.status(200).json({
      success: true,
      message: "Owner interests fetched successfully",
      interests: result,
    });

  } catch (error) {
    console.error("Error fetching owner interests:", error);
    res.status(500).json({
      success: false,
      message: "Server error: Unable to fetch owner interests",
    });
  }
};
export const deleteInterest = async (req, res) => {
  try {
    const { interestId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(interestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interest ID",
      });
    }

    const interest = await Interested.findById(interestId).populate(
      "room",
      "owner title"
    );

    if (!interest) {
      return res.status(404).json({
        success: false,
        message: "Interest not found",
      });
    }

    // 🔐 Only room owner can delete
    if (interest.room.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // ✅ FIXED HERE
    await Interested.findByIdAndDelete(interestId);

    return res.status(200).json({
      success: true,
      message: "Interest deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting interest:", error);

    return res.status(500).json({
      success: false,
      message: "Server error: Unable to delete interest",
    });
  }
};
