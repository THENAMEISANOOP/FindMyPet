"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!email) return alert("Enter email");

    try {
      // Check if email exists
      const checkRes = await api.post("/check-email", { email });
      if (checkRes.data.exists) {
        // Store email in localStorage for OTP page
        localStorage.setItem("otpEmail", email);

        // Send OTP
        await api.post("/login", { email });
        alert("OTP sent to email");

        // Redirect to OTP page
        router.push("/verify-otp");
      } else {
        alert("Email not registered. Please register first.");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Server error");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="p-6 bg-white shadow-md rounded w-96 space-y-4">
        <h2 className="text-xl font-bold">Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          Send OTP
        </button>

        {/* New User Register Button */}
        <p className="text-center mt-2">
          New User?{" "}
          <button
            onClick={() => router.push("/register")}
            className="text-blue-500 underline"
          >
            Register Here
          </button>
        </p>
      </div>
    </div>
  );
}
