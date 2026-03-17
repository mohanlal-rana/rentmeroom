import mongoose from "mongoose";

const interestedSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    message: { type: String, trim: true },

  },

  { timestamps: true } // adds createdAt & updatedAt
);

const Interested = mongoose.model("Interested", interestedSchema);
export default Interested;