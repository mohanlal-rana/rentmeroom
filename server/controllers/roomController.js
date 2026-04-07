import axios from "axios";
import Room from "../models/roomModel.js";
import buildAddressString from "../utils/buildAddressString.js";
import mongoose from "mongoose";
import User from "../models/userModel.js";

//public controller
export const getRoom = async (req, res) => {
  try {
    const rooms = await Room.find({ isVerified: true, isActive: true,avilableRoom: { $gte: 1 } }).select("-contact");
    // console.log(rooms);
    if (rooms.length == 0) {
      return res
        .status(404)
        .json({ success: false, message: "no rooms are there" });
    }
    res.status(200).json({
      success: true,
      message: "Rooms fetched successfully",
      rooms,
    });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Unable to fetch rooms",
      error: error.message,
    });
  }
};

export const getRoomById = async (req, res) => {
  try {
    const id = req.params.id;
    const room = await Room.findOne({ _id: id, isVerified: true, isActive: true,avilableRoom: { $gte: 1 } }).select("-contact");
    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "no room is found" });
    }
    res
      .status(200)
      .json({ success: true, message: "room fetched successfully", room });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Unable to fetch rooms",
      error: error.message,
    });
  }
};

export const searchRooms = async (req, res) => {
  try {
    const {
      keywords,
      minRent,
      maxRent,
      features, // comma-separated: "wifi,parking"
      page = 1,
      limit = 20,
    } = req.query;

    const filter = { isVerified: true, isActive: true };

    // Text search
    if (keywords) {
      filter.$or = [
        { title: { $regex: keywords, $options: "i" } },
        { description: { $regex: keywords, $options: "i" } },
        { "address.country": { $regex: keywords, $options: "i" } },
        { "address.district": { $regex: keywords, $options: "i" } },
        { "address.municipality": { $regex: keywords, $options: "i" } },
        { "address.street": { $regex: keywords, $options: "i" } },
      ];
    }

    // Rent filter
    if (minRent || maxRent) {
      filter.rent = {};
      if (minRent) filter.rent.$gte = parseFloat(minRent);
      if (maxRent) filter.rent.$lte = parseFloat(maxRent);
    }

    // Features filter
    if (features) {
      const featureArray = features.split(",").map((f) => f.trim());
      filter.features = { $all: featureArray };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch rooms
    const rooms = await Room.find(filter)
      .select("title rent address images features")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const result = rooms.map((r) => ({
      _id: r._id,
      title: r.title,
      rent: r.rent,
      address: r.address,
      images: r.images,
      features: r.features,
      contact: null, // always hidden
    }));

    res.status(200).json({
      success: true,
      count: result.length,
      page: parseInt(page),
      limit: parseInt(limit),
      rooms: result,
    });
  } catch (error) {
    console.error("Error searching rooms:", error);
    res.status(500).json({
      success: false,
      message: "Server error: Unable to search rooms",
    });
  }
};
//user controller
export const saveRoom = async (req, res) => {
  try {
    const userId = req.user._id;
    const roomId = req.params.id;

    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { saved: roomId } }, // 🔥 auto prevent duplicates
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "Room saved successfully",
    });
  } catch (error) {
    console.log("SAVE ERROR:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};
export const unsaveRoom = async (req, res) => {
  try {
    const userId = req.user._id;
    const roomId = req.params.id;

    const user = await User.findById(userId);

    user.saved = user.saved.filter((id) => id.toString() !== roomId.toString());

    await user.save();

    res.status(200).json({
      success: true,
      message: "Room unsaved successfully",
      saved: user.saved,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
export const getSavedRooms = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate("saved");

    res.status(200).json({
      success: true,
      savedRooms: user.saved,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
//owner controller
export const addRoom = async (req, res) => {
  try {
    const { title, rent, noOfRoom, address, location, contact, features, description } =
      req.body;

    // 1️⃣ Assign roomLocation from parsed FormData
    let roomLocation = location;

    // 2️⃣ Handle uploaded images
    const images = req.files
      ? req.files.map((file) => ({
        url: `/uploads/${file.filename}`,
        public_id: file.filename,
      }))
      : [];

    // 3️⃣ Only try geocoding if location is missing or invalid
    if (
      !roomLocation ||
      !roomLocation.coordinates ||
      roomLocation.coordinates.length !== 2
    ) {
      try {
        const addressString = buildAddressString(address);
        const geoRes = await axios.get(
          `https://nominatim.openstreetmap.org/search`,
          {
            params: {
              q: addressString,
              format: "json",
              limit: 1,
            },
            headers: {
              "User-Agent": "RoomFinderApp/1.0",
            },
          },
        );

        const geo = geoRes.data[0];

        if (geo) {
          roomLocation = {
            type: "Point",
            coordinates: [parseFloat(geo.lon), parseFloat(geo.lat)],
          };
        } else {
          roomLocation = null; // geocoding failed
        }
      } catch (geoError) {
        console.warn(
          "Geocoding failed, setting location as null",
          geoError.message,
        );
        roomLocation = null;
      }
    }
    if (!noOfRoom || Number(noOfRoom) < 1) {
      return res.status(400).json({
        success: false,
        message: "Number of rooms must be at least 1",
      });
    }
    const roomCount = parseInt(noOfRoom);

    if (isNaN(roomCount) || roomCount < 1) {
      return res.status(400).json({
        success: false,
        message: "Number of rooms must be a valid number and at least 1",
      });
    }
    // 4️⃣ Save Room
    const newRoom = new Room({
      title,
      owner: req.user._id,
      images,
      rent: parseInt(rent),
      noOfRoom: roomCount,
      avilableRoom: roomCount,
      address,
      location: roomLocation,
      contact,
      features,
      description,
    });

    const savedRoom = await newRoom.save();

    res.status(201).json({
      success: true,
      message: "Room added successfully",
      room: savedRoom,
    });
  } catch (error) {
    console.log(error)
    console.error("Error adding room:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Unable to add room",
      error: error.message,
    });
  }
};

export const getAllOwnerRooms = async (req, res) => {
  try {
    const ownerId = req.user._id;

    const rooms = await Room.find({ owner: ownerId });

    if (!rooms.length) {
      return res.status(404).json({
        success: false,
        message: "No rooms found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Rooms fetched successfully",
      rooms,
    });
  } catch (error) {
    console.error("Error fetching owner's rooms:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching rooms",
    });
  }
};

export const getOwnerRoomById = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const roomId = req.params.id;

    const room = await Room.findOne({
      _id: roomId,
      owner: ownerId,
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Room fetched successfully",
      room,
    });
  } catch (error) {
    console.error("Error fetching owner's room:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching room",
    });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id);

    // ================= VALIDATION =================
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    if (room.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // ================= PARSE FORM DATA =================
    if (req.body.address && typeof req.body.address === "string") {
      req.body.address = JSON.parse(req.body.address);
    }

    if (req.body.location && typeof req.body.location === "string") {
      req.body.location = JSON.parse(req.body.location);
    }

    if (
      req.body.existingImages &&
      typeof req.body.existingImages === "string"
    ) {
      req.body.existingImages = JSON.parse(req.body.existingImages);
    }

    // ================= UPDATE FIELDS =================
    room.title = req.body.title || room.title;
    room.rent = req.body.rent ? Number(req.body.rent) : room.rent;
    room.contact = req.body.contact || room.contact;
    room.description = req.body.description || room.description;

    // features (handle array properly)
    if (req.body.features) {
      room.features = Array.isArray(req.body.features)
        ? req.body.features
        : [req.body.features];
    }

    room.address = req.body.address || room.address;

    // // ✅ noOfRoom FIX
    // if (req.body.noOfRoom) {
    //   const rooms = Number(req.body.noOfRoom);
    //   if (rooms < 1) {
    //     return res.status(400).json({
    //       success: false,
    //       message: "Number of rooms must be at least 1",
    //     });
    //   }
    //   room.noOfRoom = rooms;
    // }

    // ================= UPDATE LOCATION =================
    if (
      req.body.location &&
      req.body.location.coordinates &&
      req.body.location.coordinates.length === 2
    ) {
      room.location = req.body.location;
    }

    // ================= UPDATE IMAGES =================
    let updatedImages = [];

    // Keep existing images
    if (Array.isArray(req.body.existingImages)) {
      updatedImages = [...req.body.existingImages];
    }

    // Add new uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({
        url: `/uploads/${file.filename}`,
        public_id: file.filename,
      }));
      updatedImages = [...updatedImages, ...newImages];
    }

    room.images = updatedImages;

    // ================= SAVE =================
    const updatedRoom = await room.save();

    res.status(200).json({
      success: true,
      message: "Room updated successfully",
      room: updatedRoom,
    });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Unable to update room",
      error: error.message,
    });
  }
};

export const paymentslip = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Check if file exists (provided by Multer)
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Please select an image."
      });
    }

    // 2. Construct the file URL/Path
    // If you are serving static files from '/uploads', store the path
    const slipUrl = `/uploads/${req.file.filename}`;

    // 3. Update the Room document
    const updatedRoom = await Room.findByIdAndUpdate(
      id,
      {
        paymentSlip: {
          url: slipUrl,
          uploadedAt: new Date()
        }
      },
      { new: true } // Return the updated document
    );

    if (!updatedRoom) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    res.status(200).json({
      success: true,
      message: "Payment slip uploaded successfully!",
      room: updatedRoom,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const toggleRoomStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id);

    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    // Only owner can disable/enable
    if (room.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    room.isActive = !room.isActive;
    await room.save();

    res.status(200).json({
      success: true,
      message: `Room is now ${room.isActive ? "active" : "disabled"}`,
      room,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const increaseAvialableRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id);

    if (!room) return res.status(404).json({ success: false, message: "Room not found" });

    // Logic: Cannot exceed the total number of rooms
    if (room.avilableRoom >= room.noOfRoom) {
      return res.status(400).json({
        success: false,
        message: `Cannot increase. Maximum limit of ${room.noOfRoom} reached.`
      });
    }

    room.avilableRoom += 1;
    await room.save();

    res.status(200).json({ success: true, room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const decreaseAvialableRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id);

    if (!room) return res.status(404).json({ success: false, message: "Room not found" });

    // Logic: Cannot go below 0
    if (room.avilableRoom <= 0) {
      return res.status(400).json({
        success: false,
        message: "No rooms available to decrease."
      });
    }

    room.avilableRoom -= 1;
    await room.save();

    res.status(200).json({ success: true, room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const id = req.params.id;
    const room = await Room.findById(id);
    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "no room is found" });
    }
    //check ownership
    if (room.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "you are not authorized to delete this room",
      });
    }
    await Room.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "room deleted successfully" });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Unable to delete room",
      error: error.message,
    });
  }
};
//admin controller

export const getAllRoom = async (req, res) => {
  try {
    const rooms = await Room.find().populate("owner", "name email role"); // 👈 only selected fields

    if (rooms.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No rooms found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Room fetched successfully",
      rooms,
    });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Unable to fetch rooms",
      error: error.message,
    });
  }
};
export const getAdminRoomById = async (req, res) => {
  try {
    const id = req.params.id;
    const room = await Room.findById(id).populate(
      "owner",
      "name email phone createdAt",
    );

    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "no room is found" });
    }
    res
      .status(200)
      .json({ success: true, message: "room fetched successfully", room });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Unable to fetch rooms",
      error: error.message,
    });
  }
};

export const verifyRoom = async (req, res) => {
  try {
    const id = req.params.id;
    const room = await Room.findById(id);
    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "no room is found" });
    }
    room.isVerified = true;
    await room.save();
    res
      .status(200)
      .json({ success: true, message: "room verified successfully" });
  } catch (error) {
    console.error("Error verifying room:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Unable to verify room",
      error: error.message,
    });
  }
};
export const deleteRoomByAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    const room = await Room.findById(id);
    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "no room is found" });
    }
    await Room.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "room deleted successfully" });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Unable to delete room",
      error: error.message,
    });
  }
}
