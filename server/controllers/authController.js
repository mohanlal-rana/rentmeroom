import TempUser from "../models/tempUserModel.js";
import User from "../models/userModel.js";
import sendotp from "../utils/sendOTP.js";

export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: "User already exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await TempUser.findOneAndUpdate(
      { email },
      {
        name,
        email,
        password,
        otp,
        otpExpires: Date.now() + 5 * 60 * 1000,
      },
      {
        upsert: true,
      }
    );
    sendotp(email, otp);

    res.status(200).json({
      message: "OTP is sent to your email. Please verify your email.",
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};
export const verifyotp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const tempUser = await TempUser.findOne({ email });
    if (!tempUser) {
      return res.status(400).json({ error: "please signup again" });
    }
    if (tempUser.otp != otp) {
      return res.status(400).json({ error: "invalid otp" });
    }
    if (tempUser.otpExpires < Date.now()) {
      await TempUser.deleteOne({ email });
      return res
        .status(400)
        .json({ error: "otp expired.Please sign up again." });
    }
    
    const user = new User({
      name: tempUser.name,
      email: tempUser.email,
      password: tempUser.password,
    });

    await user.save();
    await TempUser.deleteOne({ email });

    const token = await user.generateToken();

    res.status(200).json({
      message: "Account is created.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (!userExists) {
      return res.status(404).json({ message: "user doesnot exists" });
    }
    const isMatch = await userExists.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }
    res.status(200).json({
      message: "login successfull",
      token: await userExists.generateToken(),
      user: {
        id: userExists._id,
        name: userExists.name,
        email: userExists.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "server error" });
  }
};
