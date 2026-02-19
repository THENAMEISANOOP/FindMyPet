"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Phone, MessageCircle, Mail, AlertTriangle, Loader2, Info } from "lucide-react";

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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="animate-spin text-teal-500 mb-4" size={48} strokeWidth={2.5} />
        <p className="text-slate-500 font-bold animate-pulse text-sm uppercase tracking-widest">Locating Pet Details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white shadow-xl shadow-rose-500/10 border border-rose-100 rounded-[2rem] p-8 text-center max-w-md w-full">
          <div className="bg-rose-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="text-rose-500" size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Scan Error</h2>
          <p className="text-slate-500 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!pet) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 selection:bg-teal-200">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/60 border border-slate-100 max-w-md w-full overflow-hidden relative"
      >
        {/* Decorative Header Background */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-br from-teal-500 via-emerald-400 to-teal-600"></div>

        <div className="flex flex-col items-center pt-16 px-6 pb-8 relative z-10">
          
          {/* Pet Avatar */}
          <div className="relative w-32 h-32 rounded-full ring-4 ring-white shadow-xl bg-slate-50 overflow-hidden mb-5">
            {pet.photo ? (
               <img
                 src={pet.photo}
                 alt={pet.name}
                 className="w-full h-full object-cover"
               />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-teal-50 text-teal-200">
                 <Info size={48} />
              </div>
            )}
          </div>

          {/* Pet Info */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              {pet.name}
            </h1>
            <div className="inline-flex items-center justify-center px-4 py-1.5 bg-slate-100 rounded-full border border-slate-200">
               <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                 Age: <span className="text-teal-600">{pet.age} Years</span>
               </span>
            </div>
          </div>

          {/* Owner Context Box */}
          <div className="w-full bg-teal-50/50 border border-teal-100 p-4 rounded-2xl mb-6 text-center shadow-inner shadow-teal-100/50">
            <p className="text-xs font-bold text-teal-800/60 uppercase tracking-widest mb-1">
              Pet Owner
            </p>
            <p className="text-lg font-black text-teal-900">
              {pet.ownerName}
            </p>
            <p className="text-sm font-medium text-teal-700/80 mt-1">
              Please reach out immediately to help return this pet safely.
            </p>
          </div>

          {/* EMERGENCY ACTION BUTTONS */}
          <div className="grid grid-cols-1 gap-3 w-full">
            
            {/* Call Action - Primary */}
            <a
              href={`tel:${pet.ownerMobile}`}
              className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-95 group"
            >
              <Phone size={20} className="text-teal-400 group-hover:scale-110 transition-transform" />
              <span>Call Owner</span>
            </a>

            {/* WhatsApp Action */}
            <a
              href={`https://wa.me/91${pet.ownerWhatsapp}?text=Hi, I found your pet ${pet.name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] text-white p-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-[#20bd5a] transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-95 group"
            >
              <MessageCircle size={20} className="group-hover:scale-110 transition-transform" />
              <span>WhatsApp</span>
            </a>

            {/* Email Action - Secondary */}
            <a
              href={`mailto:${pet.ownerEmail}?subject=Found your pet&body=Hi, I found your pet ${pet.name}`}
              className="w-full bg-white border-2 border-slate-100 text-slate-600 p-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:border-slate-200 hover:bg-slate-50 transition-all active:scale-95 group"
            >
              <Mail size={20} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
              <span>Email Owner</span>
            </a>

          </div>
        </div>
      </motion.div>
    </div>
  );
}