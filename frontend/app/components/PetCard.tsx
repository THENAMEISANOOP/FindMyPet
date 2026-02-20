"use client";
import React, { memo } from "react";
import { PawPrint, ShoppingBag, CreditCard } from "lucide-react";

interface PetCardProps {
  pet: any;
  index: number;
  onBuyTag: (petId: string) => void;
  onBuyBelt: (petId: string) => void;
}

const PetCard = memo(({ pet, index, onBuyTag, onBuyBelt }: PetCardProps) => {
  return (
    <div 
      className="bg-white p-2.5 rounded-[1.5rem] border border-slate-100 shadow-md shadow-slate-200/50 hover:shadow-xl hover:shadow-teal-500/15 hover:-translate-y-1.5 transition-all duration-500 group relative animate-in slide-in-from-bottom-12 fade-in fill-mode-both flex flex-col"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      {/* Pet Image Container */}
      <div className="relative h-48 w-full rounded-[1rem] overflow-hidden bg-slate-50 border border-slate-100/50 flex items-center justify-center p-2 shrink-0">
        {pet.photo ? (
          <img 
            src={pet.photo} 
            alt={pet.name} 
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-700 ease-out" 
          />
        ) : (
          <PawPrint size={48} className="text-slate-200 group-hover:text-teal-500/20 group-hover:scale-110 transition-all duration-500" />
        )}

        {/* Floating Age Badge */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xl px-3 py-1 rounded-full shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{pet.age} YRS</p>
        </div>
      </div>
      
      {/* Pet Details & Dynamic Actions */}
      <div className="px-3 pt-5 pb-2 flex-1 flex flex-col">
        <h3 className="text-2xl font-black text-slate-900 mb-5 group-hover:text-teal-600 transition-colors duration-300 tracking-tight line-clamp-1">
          {pet.name}
        </h3>
        
        <div className="grid grid-cols-2 gap-2.5 mt-auto">
          <button 
            onClick={() => onBuyTag(pet._id)}
            className="flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-teal-500 border border-slate-100 hover:border-teal-500 rounded-2xl transition-all duration-300 group/btn active:scale-95"
          >
            <ShoppingBag size={18} className="text-slate-400 group-hover/btn:text-white mb-1.5 group-hover/btn:-translate-y-1 transition-all duration-300" />
            <span className="text-[9px] font-bold text-slate-500 group-hover/btn:text-teal-100 uppercase tracking-widest mb-0.5">QR Tag</span>
            <span className="text-sm font-black text-slate-800 group-hover/btn:text-white">₹50</span>
          </button>

          <button 
            onClick={() => onBuyBelt(pet._id)}
            className="flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-teal-500 border border-slate-100 hover:border-teal-500 rounded-2xl transition-all duration-300 group/btn active:scale-95"
          >
            <CreditCard size={18} className="text-slate-400 group-hover/btn:text-white mb-1.5 group-hover/btn:-translate-y-1 transition-all duration-300" />
            <span className="text-[9px] font-bold text-slate-500 group-hover/btn:text-teal-100 uppercase tracking-widest mb-0.5">Belt</span>
            <span className="text-sm font-black text-slate-800 group-hover/btn:text-white">₹299</span>
          </button>
        </div>
      </div>
    </div>
  );
});

PetCard.displayName = "PetCard";

export default PetCard;
