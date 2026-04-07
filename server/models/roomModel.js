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

    address: {
      country: { type: String, required: true }, // Nepal
      province: { type: String }, // Sudurpashchim
      district: { type: String, required: true }, // Kailali
      municipality: { type: String, required: true }, // Dhangadhi
      wardNo: { type: Number }, // 3
      street: { type: String }, // Main Road
      houseNo: { type: String }, // 12B
      landmark: { type: String }, // Near hospital (optional)
    },

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
    noOfRoom: {
      type: Number,
      required: true,
      min: 1
    },
    avilableRoom:{
      type:Number,
    },
    description: { type: String, required: true },
    paymentSlip: {
      url: { type: String },
      public_id: { type: String },
    },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
  },

  { timestamps: true }, // adds createdAt & updatedAt
);

// Enable geospatial index for searching nearby rooms
roomSchema.index({ location: "2dsphere" });

const Room = mongoose.model("Room", roomSchema);
export default Room;
