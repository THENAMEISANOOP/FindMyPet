import { Request, Response } from "express";
import User from "../models/User.model";
import { sendEmail } from "../utils/sendEmail";

// Check if email exists
export const checkEmail = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  res.json({ exists: !!user });
};

// Register new user
export const registerUser = async (req: Request, res: Response) => {
  const { username, email, mobile, whatsapp } = req.body;

  try {
    // Check required fields
    if (!username || !email || !mobile || !whatsapp)
      return res.status(400).json({ success: false, message: "All fields required" });

    // Validate Indian mobile number
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile))
      return res.status(400).json({ success: false, message: "Invalid mobile number" });

    if (!mobileRegex.test(whatsapp))
      return res.status(400).json({ success: false, message: "Invalid WhatsApp number" });

    // Check email uniqueness
    const existingEmail = await User.findOne({ email });
    if (existingEmail)
      return res.status(400).json({ success: false, message: "Email already exists" });

    // Check WhatsApp uniqueness
    const existingWhatsapp = await User.findOne({ whatsapp });
    if (existingWhatsapp)
      return res.status(400).json({ success: false, message: "WhatsApp number already exists" });

    // Check mobile uniqueness
    const existingMobile = await User.findOne({ mobile });
    if (existingMobile)
      return res.status(400).json({ success: false, message: "Mobile number already exists" });

    // Create user
    await User.create({ username, email, mobile, whatsapp });

    res.json({ success: true, message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};



// Send login OTP
export const sendLoginOTP = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail(email, "FindMyPet OTP", `Your OTP is: ${otp}`);
    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};



// Verify OTP
export const verifyOTP = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check OTP
    if (!user.otp || user.otp !== otp || user.otpExpires! < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // ✅ MAIN FIX
    user.isVerified = true;

    // cleanup
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();


    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        whatsapp: user.whatsapp
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update User Profile
export const updateProfile = async (req: Request, res: Response) => {
  const { email, username, mobile, whatsapp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (username) user.username = username;
    if (mobile) user.mobile = mobile;
    if (whatsapp) user.whatsapp = whatsapp;

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        whatsapp: user.whatsapp
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};


