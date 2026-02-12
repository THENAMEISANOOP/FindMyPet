import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    mobile: { type: String, required: true },
    whatsapp: { type: String, required: true },
    otp: { type: String },
    otpExpires: { type: Date },
    isVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
  
);

export default mongoose.model("User", userSchema);
