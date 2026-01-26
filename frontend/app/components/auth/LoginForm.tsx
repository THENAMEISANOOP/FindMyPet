"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import { useOtpTimer } from "@/app/hooks/useOtpTimer";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // 5 minutes = 300 seconds
  const { timeLeft, expired } = useOtpTimer(otpSent, 300);

  const sendOtp = async () => {
    if (!email) return alert("Enter email");

    try {
      setLoading(true);
      await api.post("/auth/login", { email });
      setOtpSent(true);
    } catch {
      alert("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) return alert("Enter OTP");

    try {
      const res = await api.post("/auth/verify-otp", { email, otp });
      localStorage.setItem("token", res.data.token);
      router.push("/home");
    } catch {
      alert("Invalid or expired OTP");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl"
    >
      <h2 className="text-xl font-bold text-center mb-6">
        Login 🐾
      </h2>

      {/* EMAIL INPUT */}
      {!otpSent && (
        <>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full border p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            onClick={sendOtp}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
          >
            {loading ? "Sending OTP..." : "Continue"}
          </button>
        </>
      )}

      {/* OTP INPUT */}
      <AnimatePresence>
        {otpSent && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full border p-3 rounded-lg mb-2 text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-green-500"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <p className="text-sm text-center text-red-500 mb-3">
              OTP expires in{" "}
              <b>
                {Math.floor(timeLeft / 60)}:
                {String(timeLeft % 60).padStart(2, "0")}
              </b>
            </p>

            <button
              onClick={verifyOtp}
              disabled={expired}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              Verify & Login
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REGISTER LINK */}
      {!otpSent && (
        <p className="text-center text-sm mt-6 text-gray-600">
          Don&apos;t have an account?{" "}
          <button
            onClick={() => router.push("/register")}
            className="text-purple-600 font-semibold hover:underline"
          >
            Register
          </button>
        </p>
      )}
    </motion.div>
  );
}
