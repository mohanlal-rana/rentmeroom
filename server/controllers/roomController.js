import axios from "axios";
import Room from "../models/roomModel.js";
import buildAddressString from "../utils/buildAddressString.js";

//public controller
export const getRoom = async (req, res) => {
  try {
    const rooms = await Room.find({ isVerified: true }).select("-contact");
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
    const room = await Room.findById(id).select("-contact");
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
      lat,
      lng,
      radius, // meters
      page = 1,
      limit = 20,
    } = req.query;

    const filter = { isVerified: true };

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

    // Nearby search
    if (lat && lng) {
      const longitude = parseFloat(lng);
      const latitude = parseFloat(lat);
      if (!isNaN(longitude) && !isNaN(latitude)) {
        filter.location = {
          $near: {
            $geometry: { type: "Point", coordinates: [longitude, latitude] },
            $maxDistance: radius ? parseInt(radius) : 5000, // default 5km
          },
        };
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch rooms
    const rooms = await Room.find(filter)
      .select("title rent address images location features") // contact always hidden
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const result = rooms.map((r) => ({
      _id: r._id,
      title: r.title,
      rent: r.rent,
      address: r.address,
      images: r.images,
      location: r.location,
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

//owner controller
export const addRoom = async (req, res) => {
  try {
    const { title, rent, address, location, contact, features, description } =
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

    // 4️⃣ Save Room
    const newRoom = new Room({
      title,
      owner: req.user._id,
      images,
      rent: parseInt(rent),
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

    if (!room)
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    if (room.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    // ================= Update Fields =================
    room.title = req.body.title || room.title;
    room.rent = req.body.rent ? Number(req.body.rent) : room.rent;
    room.contact = req.body.contact || room.contact;
    room.description = req.body.description || room.description;
    room.features = req.body.features || room.features;
    room.address = req.body.address || room.address;

    // ================= Update Location =================
    if (req.body.location && req.body.location.coordinates) {
      room.location = req.body.location;
    }

    // ================= Update Images =================
    let updatedImages = [];

    // Take existing images sent from frontend
    if (req.body.existingImages && Array.isArray(req.body.existingImages)) {
      updatedImages = [...req.body.existingImages]; // <-- just take them
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

    await room.save();

    res.status(200).json({
      success: true,
      message: "Room updated successfully",
      room,
    });
  } catch (error) {
    console.error("Update Error:", error);
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
