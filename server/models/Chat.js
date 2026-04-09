// models/Chat.js
import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  interestId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Interested", 
    required: true,
    unique: true  // Add unique constraint
  },
  participants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt timestamp on save
chatSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Chat", chatSchema);