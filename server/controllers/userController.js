import User from "../models/userModel.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message });
  }
};
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message });
  }
};
export const verifyOwner = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    if (user.role !== "owner") {
      return res.status(400).json({ message: "user is not an owner" });
    }
    user.owner.isVerified = true;
    await user.save();
    res.status(200).json({ message: "owner verified successfully", user });
  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message });
  }
};
export const deleteUser = async (req, res) => {
    console.log("inside delete user")
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    res.status(400).json({ message: "user deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message });
  }
};

//be owner controller

export const beOwner = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      phone,
      address,
      govIDType,
      govIDNumber,
      bio,
      facebook,
      whatsapp
    } = req.body;

    // uploaded images
    const profileImage = req.files?.profileImage?.[0]?.filename || null;
    const govIDImage = req.files?.govIDImage?.[0]?.filename || null;

    // Find user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if already owner
    if (user.role === "owner") {
      return res.status(400).json({ message: "User is already an owner" });
    }
     console.log(phone,govIDNumber,govIDImage,govIDType)
     
    if (!phone || !govIDType || !govIDNumber || !govIDImage) {
      return res
        .status(400)
        .json({ message: "Phone, govIDType, govIDNumber, govIDImage are required" });
    }

    // Update user to owner
    user.role = "owner";
    user.owner = {
      phone,
      address: address || "",
      govIDType,
      govIDNumber,
      govIDImage,
      profileImage,
      bio: bio || "",
      facebook: facebook || "",
      whatsapp: whatsapp || "",
      propertyCount: 0,
      isVerified: false
    };

    await user.save();

    res.status(200).json({
      message: "User upgraded to owner successfully",
      user
    });
  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message });
  }
};
