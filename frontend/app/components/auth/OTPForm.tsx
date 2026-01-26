"use client";

import { useState } from "react";
import api from "@/app/lib/api";
import { useOtpTimer } from "@/app/hooks/useOtpTimer";
import { motion } from "framer-motion";

export default function OTPForm({ email }: { email: string }) {
  const [otp, setOtp] = useState("");
  const { timeLeft } = useOtpTimer(60);

  const verifyOtp = async () => {
    const res = await api.post("/auth/verify-otp", { email, otp });
    localStorage.setItem("token", res.data.token);
    alert("Login successful 🎉");
  };

  return (
    <motion.div
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      className="text-center"
    >
      <p className="mb-2 text-sm text-gray-600">
        OTP sent to <b>{email}</b>
      </p>

      <input
        type="text"
        placeholder="Enter OTP"
        className="w-full border p-3 rounded-lg mb-2 text-center tracking-widest"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />

      <p className="text-sm text-red-500 mb-3">
        Expires in {timeLeft}s
      </p>

      <button
        disabled={timeLeft === 0}
        onClick={verifyOtp}
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        Verify OTP
      </button>
    </motion.div>
  );
}
