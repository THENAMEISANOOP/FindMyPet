"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../lib/api";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const router = useRouter();

  const handleRegister = async (e: any) => {
    e.preventDefault();
    if (!username || !email || !mobile || !whatsapp) return alert("All fields required");

    try {
      const res = await api.post("/register", { username, email, mobile, whatsapp });
      alert(res.data.message);
      if (res.data.success) router.push(`/verify-otp?email=${email}`);
    } catch (err: any) {
      alert(err.response?.data?.message || "Server error");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleRegister} className="p-6 bg-white shadow-md rounded w-96 space-y-4">
        <h2 className="text-xl font-bold">Register</h2>
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="input w-full p-2 border rounded"/>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="input w-full p-2 border rounded"/>
        <input placeholder="Mobile" value={mobile} onChange={e => setMobile(e.target.value)} className="input w-full p-2 border rounded"/>
        <input placeholder="WhatsApp" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="input w-full p-2 border rounded"/>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Register & Send OTP
        </button>
      </form>
    </div>
  );
}
