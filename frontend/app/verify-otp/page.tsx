"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../lib/api";

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const router = useRouter();

  // Get email from localStorage
  const email = typeof window !== "undefined" ? localStorage.getItem("otpEmail") || "" : "";

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (e: any) => {
    e.preventDefault();
    if (!email) return alert("Email not found. Please login again.");

    try {
      const res = await api.post("/verify-otp", { email, otp });
      alert(res.data.message);
      if (res.data.user) {
        // Clear stored email
        localStorage.removeItem("otpEmail");
        router.push("/dashboard");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Invalid OTP");
    }
  };

  const handleResend = async () => {
    if (!email) return alert("Email not found. Please login again.");

    try {
      await api.post("/login", { email });
      setTimer(60);
      alert("OTP resent!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Error resending OTP");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleVerify} className="p-6 bg-white shadow-md rounded w-96 space-y-4">
        <h2 className="text-xl font-bold">Enter OTP</h2>
        <p className="text-center text-gray-600">Email: {email}</p>
        <input
          placeholder="Enter OTP"
          value={otp}
          onChange={e => setOtp(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Verify OTP
        </button>
        <p className="text-center mt-2">
          {timer > 0 ? `Resend OTP in ${timer}s` :
            <button type="button" onClick={handleResend} className="text-blue-500 underline">
              Resend OTP
            </button>
          }
        </p>
      </form>
    </div>
  );
}
