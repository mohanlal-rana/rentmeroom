import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String }, // if using Cloudinary
      },
    ],

    rent: { type: Number, required: true },

    address: { type: String, required: true },

    // GeoJSON (optional, but useful for map filtering)
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },

    contact: { type: String, required: true },

    features: {
      type: [String], // ← Much better than Array
      default: [],
    },

    description: { type: String, required: true },

    isVerified: { type: Boolean, default: false },
  },

  { timestamps: true } // adds createdAt & updatedAt
);

// Enable geospatial index for searching nearby rooms
roomSchema.index({ location: "2dsphere" });

const Room = mongoose.model("Room", roomSchema);
export default Room;
