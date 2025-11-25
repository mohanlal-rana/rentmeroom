import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Define Schema
const UserSchema = new mongoose.Schema({
  // Basic info (mandatory for all users)
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["user", "owner", "admin"],
    default: "user"
  },

  // Owner-specific fields (filled when upgrading)
  owner: {
    phone: {
      type: String,
      required: function () {
        return this.role === "owner";
      }
    },
    profileImage: String,
    address: String,
    govIDType: {
      type: String,
      required: function () {
        return this.role === "owner";
      }
    },
    govIDNumber: {
      type: String,
      required: function () {
        return this.role === "owner";
      }
    },
    govIDImage: {
      type: String,
      required: function () {
        return this.role === "owner";
      }
    },
    facebook: String,
    whatsapp: String,
    bio: String,
    propertyCount: {
      type: Number,
      default: 0
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 🔐 Password Hashing
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// 🔑 Compare Password
UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// 🎟 Generate JWT Token
UserSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      userId: this._id,
      email: this.email,
      role: this.role
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "7d" }
  );
};

// Export Model (ES6)
const User = mongoose.model("User", UserSchema);
export default User;
