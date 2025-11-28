import axios from "axios";
import Room from "../models/roomModel.js";

export const addRoom = async (req, res) => {
  try {
    const { title, rent, address, location, contact, features, description } = req.body;

    // Handle uploaded images
    const images = req.files ? req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      public_id: file.filename
    })) : [];

    let roomLocation = location;

    // Only try geocoding if location is missing
    if (!roomLocation || !roomLocation.coordinates || roomLocation.coordinates.length !== 2) {
      try {
        const geoRes = await axios.get(
          `https://nominatim.openstreetmap.org/search`,
          { params: { q: address, format: "json", limit: 1 } }
        );

        const geo = geoRes.data[0];

        if (geo) {
          roomLocation = { type: "Point", coordinates: [parseFloat(geo.lon), parseFloat(geo.lat)] };
        } else {
          roomLocation = null; // set null if geocoding fails
        }

      } catch (geoError) {
        console.warn("Geocoding failed, setting location as null", geoError.message);
        roomLocation = null;
      }
    }

    const newRoom = new Room({
      title,
      owner: req.user._id,
      images,
      rent: parseInt(rent),
      address,
      location: roomLocation,
      contact,
      features,
      description
    });

    const savedRoom = await newRoom.save();

    res.status(201).json({
      success: true,
      message: "Room added successfully",
      room: savedRoom
    });

  } catch (error) {
    console.error("Error adding room:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Unable to add room",
      error: error.message
    });
  }
};
