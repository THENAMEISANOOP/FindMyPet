import { Request, Response } from "express";
import User from "../models/User.model";
import { generateOTP } from "../utils/generateOTP";
import { transporter } from "../config/mail";
import jwt from "jsonwebtoken";

/**
 * REGISTER
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, email, mobile, whatsapp } = req.body;

    if (!username || !email || !mobile || !whatsapp) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already registered" });
    }

    const user = await User.create({
      username,
      email,
      mobile,
      whatsapp,
    });

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
};

/**
 * LOGIN – SEND OTP
 */
export const sendOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not registered" });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await transporter.sendMail({
      to: email,
      subject: "FindMyPet Login OTP",
      html: `<h2>Your OTP is ${otp}</h2><p>Valid for 5 minutes</p>`,
    });

    res.json({ message: "OTP sent to registered email" });
  } catch (error) {
  console.error("OTP EMAIL ERROR:", error);
  res.status(500).json({ message: "OTP send failed", error });
}

};

/**
 * VERIFY OTP
 */
export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (
      !user ||
      user.otp !== otp ||
      !user.otpExpires ||
      user.otpExpires < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "OTP verification failed" });
  }
};
