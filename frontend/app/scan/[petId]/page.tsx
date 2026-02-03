"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

interface Pet {
  name: string;
  age: number;
  photo: string;
  ownerName: string;
  ownerEmail: string;
  ownerMobile: string;
  ownerWhatsapp: string;
}

export default function PublicScanPage() {
  const { petId } = useParams();
  const [pet, setPet] = useState<Pet | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!petId) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/scan/${petId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        return data;
      })
      .then((data) => {
        setPet(data.pet);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Something went wrong");
        setLoading(false);
      });
  }, [petId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="animate-pulse text-lg font-medium">Loading pet details…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white shadow-lg rounded-xl p-6 text-center max-w-md w-full">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!pet) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
      >
        <div className="flex flex-col items-center">
          <Image
            src={pet.photo}
            alt={pet.name}
            width={120}
            height={120}
            className="rounded-full object-cover border"
          />

          <h1 className="text-2xl font-bold mt-4">{pet.name}</h1>
          <p className="text-gray-500">Age: {pet.age}</p>

          <div className="mt-4 w-full text-center">
            <p className="text-gray-600 font-medium">
              Owner: {pet.ownerName}
            </p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="mt-6 grid grid-cols-1 gap-3 w-full">
            {/* Call */}
            <a
              href={`tel:${pet.ownerMobile}`}
              className="bg-green-600 text-white py-2 rounded-lg text-center font-semibold"
            >
              📞 Call Owner
            </a>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/91${pet.ownerWhatsapp}?text=Hi, I found your pet ${pet.name}`}
              target="_blank"
              className="bg-emerald-500 text-white py-2 rounded-lg text-center font-semibold"
            >
              💬 WhatsApp Owner
            </a>

            {/* Email */}
            <a
              href={`mailto:${pet.ownerEmail}?subject=Found your pet&body=Hi, I found your pet ${pet.name}`}
              className="bg-indigo-600 text-white py-2 rounded-lg text-center font-semibold"
            >
              ✉️ Email Owner
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
