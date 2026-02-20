"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Palette, Check, ArrowRight, Loader2 } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import CustomAlert from "@/app/components/CustomAlert";

const COLORS = [
  { name: "Midnight Black", value: "#0F172A" }, 
  { name: "Classic Tan", value: "#C19A6B" },
  { name: "Royal Blue", value: "#1E3A8A" }, 
  { name: "Forest Green", value: "#065F46" }, 
  { name: "Ruby Red", value: "#9F1239" } 
];

const STYLES = [
  { name: "Classic Leather", id: "classic" },
  { name: "Modern Nylon", id: "modern" },
  { name: "Reflective Pro", id: "reflective" }
];

function CustomizationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const petId = searchParams.get("petId");
  const type = searchParams.get("type");
  
  const [user, setUser] = useState<any>(null);
  const [alert, setAlert] = useState<{ message: string | null; type: "success" | "error" | "info" }>({ message: null, type: "info" });

  const [customization, setCustomization] = useState({
    color: COLORS[0].name,
    style: STYLES[0].name
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/auth");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Store customization in session storage
    sessionStorage.setItem("purchase_customization", JSON.stringify(customization));
    
    router.push(`/purchase/payment?petId=${petId}&type=${type}`);
  };

  if (!petId || !type) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold">
      Invalid request parameters. Please return to the dashboard.
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-teal-200">
      <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert({ ...alert, message: null })} />
      <Navbar userName={user?.username} />

      <main className="max-w-lg mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 min-h-[calc(100vh-theme(spacing.20)-theme(spacing.64))] flex flex-col">
        {/* Animated Header Section */}
        <div className="mb-6 sm:mb-8 animate-in slide-in-from-left-8 fade-in duration-700 shrink-0">
          <button 
            onClick={() => router.back()} 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-teal-600 transition-colors mb-4 font-bold text-[11px] sm:text-xs uppercase tracking-widest group"
          >
            <div className="bg-slate-200/50 p-1.5 rounded-full group-hover:bg-teal-100 transition-colors">
              <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" strokeWidth={3} /> 
            </div>
            Back
          </button>
          
          <div className="flex items-center gap-3">
             <div className="bg-teal-500 p-2 sm:p-2.5 rounded-xl shadow-sm shadow-teal-500/20 shrink-0">
               <Palette className="text-white" size={20} strokeWidth={2.5} />
             </div>
             <h1 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-800 tracking-tight pb-1">
               Customize Belt
             </h1>
          </div>
        </div>

        <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden animate-in slide-in-from-bottom-12 fade-in duration-700 delay-150 fill-mode-both w-full">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-teal-50 to-transparent rounded-bl-[3rem] opacity-60 pointer-events-none"></div>

          <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10 relative z-10">
            <div className="space-y-3.5">
              <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                Choose Color
              </label>
              
              <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
                {COLORS.map((color) => {
                  const isSelected = customization.color === color.name;
                  return (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setCustomization({...customization, color: color.name})}
                      className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-full transition-all duration-300 flex items-center justify-center active:scale-90 ${
                        isSelected 
                          ? 'ring-4 ring-offset-2 ring-teal-500 shadow-lg scale-105' 
                          : 'ring-1 ring-slate-200 hover:ring-slate-300 shadow-sm hover:scale-105 hover:shadow-md'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                      aria-label={`Select ${color.name}`}
                    >
                      {isSelected && (
                        <Check size={18} strokeWidth={3} className="text-white drop-shadow-md animate-in zoom-in-50 duration-200" />
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] sm:text-xs font-bold text-slate-400 mt-2 ml-1">
                Selected: <span className="text-teal-600 font-extrabold">{customization.color}</span>
              </p>
            </div>

            <div className="space-y-3.5">
              <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                Choose Style
              </label>
              
              <div className="grid grid-cols-1 gap-3">
                {STYLES.map((style) => {
                  const isSelected = customization.style === style.name;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setCustomization({...customization, style: style.name})}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 flex items-center justify-between group active:scale-[0.98] ${
                        isSelected 
                          ? 'border-teal-500 bg-teal-50/50 shadow-md shadow-teal-500/10' 
                          : 'border-slate-100 hover:border-teal-500/30 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`text-sm sm:text-base font-bold transition-colors ${isSelected ? 'text-teal-700' : 'text-slate-700 group-hover:text-slate-900'}`}>
                        {style.name}
                      </span>
                      
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isSelected 
                          ? 'bg-teal-500 text-white scale-100' 
                          : 'bg-slate-200/50 text-transparent scale-90 group-hover:bg-slate-200'
                      }`}>
                        <Check size={14} strokeWidth={3} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3.5 sm:py-4 rounded-xl shadow-md shadow-teal-500/25 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 mt-8 group"
            >
              <span className="text-sm sm:text-base">Confirm and Proceed</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function CustomizationPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-teal-500" size={48} strokeWidth={2.5} />
      </div>
    }>
      <CustomizationContent />
    </Suspense>
  );
}
