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
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: "Email already exists" });

    const user = await User.create({ username, email, mobile, whatsapp });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail(email, "FindMyPet OTP", `Your OTP is: ${otp}`);
    res.json({ success: true, message: "User registered and OTP sent" });
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
    if (!user) return res.status(400).json({ message: "User not found" });

    if (!user.otp || user.otp !== otp || user.otpExpires! < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: "OTP verified", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
