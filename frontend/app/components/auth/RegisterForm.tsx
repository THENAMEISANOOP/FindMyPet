"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import { motion } from "framer-motion";
import { AxiosError } from "axios";

interface RegisterFormState {
  username: string;
  email: string;
  mobile: string;
  whatsapp: string;
}

export default function RegisterForm() {
  const router = useRouter();

  const [form, setForm] = useState<RegisterFormState>({
    username: "",
    email: "",
    mobile: "",
    whatsapp: "",
  });

  const register = async () => {
    try {
      await api.post("/auth/register", form);

      // Redirect to login with email
      router.push(`/login?email=${form.email}`);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;

      if (err.response?.status === 409) {
        alert("User already exists. Redirecting to login 🔐");
        router.push(`/login?email=${form.email}`);
      } else {
        alert("Registration failed. Please try again ❌");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-gray-100"
    >
      <h2 className="text-2xl font-extrabold text-center mb-2 text-purple-700">
        Create Account 🐾
      </h2>

      <p className="text-center text-gray-500 mb-6 text-sm">
        Help your pet find its way home
      </p>

      <input
        placeholder="Owner Name"
        className="w-full border border-gray-300 p-3 mb-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
        value={form.username}
        onChange={(e) =>
          setForm({ ...form, username: e.target.value })
        }
      />

      <input
        type="email"
        placeholder="Email Address"
        className="w-full border border-gray-300 p-3 mb-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
        value={form.email}
        onChange={(e) =>
          setForm({ ...form, email: e.target.value })
        }
      />

      <input
        type="tel"
        placeholder="Mobile Number"
        className="w-full border border-gray-300 p-3 mb-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
        value={form.mobile}
        onChange={(e) =>
          setForm({ ...form, mobile: e.target.value })
        }
      />

      <input
        type="tel"
        placeholder="WhatsApp Number"
        className="w-full border border-gray-300 p-3 mb-5 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
        value={form.whatsapp}
        onChange={(e) =>
          setForm({ ...form, whatsapp: e.target.value })
        }
      />

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={register}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:opacity-90 transition"
      >
        Register & Continue
      </motion.button>

      <p className="text-center text-sm text-gray-500 mt-5">
  Already registered?{" "}
  <span
    onClick={() => router.push("/login")}
    className="text-purple-600 font-semibold cursor-pointer hover:underline"
  >
    Login →
  </span>
</p>

    </motion.div>
  );
}
