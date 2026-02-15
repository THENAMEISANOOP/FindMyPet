"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Palette, Check, Loader2 } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import CustomAlert from "@/app/components/CustomAlert";

const COLORS = [
  { name: "Midnight Black", value: "#000000" },
  { name: "Classic Tan", value: "#C19A6B" },
  { name: "Royal Blue", value: "#002366" },
  { name: "Forest Green", value: "#228B22" },
  { name: "Ruby Red", value: "#E0115F" }
];

const STYLES = [
  { name: "Classic Leather", id: "classic" },
  { name: "Modern Nylon", id: "modern" },
  { name: "Reflective Pro", id: "reflective" }
];

export default function CustomizationPage() {
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

  if (!petId || !type) return <div>Invalid request</div>;

  return (
    <div className="min-h-screen bg-brand-beige text-brand-charcoal font-sans">
      <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert({ ...alert, message: null })} />
      <Navbar userName={user?.username} />

      <main className="max-w-2xl mx-auto p-6 py-12">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-brand-charcoal/50 hover:text-brand-teal transition-colors mb-8 font-bold text-sm uppercase tracking-wider group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
        </button>

        <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-brand-sand/40 relative overflow-hidden">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-brand-lime/10 p-3 rounded-2xl text-brand-lime">
              <Palette size={24} />
            </div>
            <h1 className="text-3xl font-black tracking-tight">Customize Belt</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Color Selection */}
            <div className="space-y-4">
              <label className="text-sm font-black uppercase tracking-widest text-brand-charcoal opacity-40">Choose Color</label>
              <div className="flex flex-wrap gap-4">
                {COLORS.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setCustomization({...customization, color: color.name})}
                    className={`w-12 h-12 rounded-full border-4 transition-all ${customization.color === color.name ? 'border-brand-teal scale-110 shadow-lg' : 'border-transparent shadow-sm'}`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {customization.color === color.name && <Check size={20} className="text-white mx-auto drop-shadow-md" />}
                  </button>
                ))}
              </div>
              <p className="text-sm font-bold text-brand-charcoal/60">Selected: <span className="text-brand-charcoal">{customization.color}</span></p>
            </div>

            {/* Style Selection */}
            <div className="space-y-4">
              <label className="text-sm font-black uppercase tracking-widest text-brand-charcoal opacity-40">Choose Style</label>
              <div className="grid grid-cols-1 gap-3">
                {STYLES.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setCustomization({...customization, style: style.name})}
                    className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${customization.style === style.name ? 'border-brand-teal bg-brand-teal/5 ring-4 ring-brand-teal/5' : 'border-brand-sand/20 hover:border-brand-sand/50'}`}
                  >
                    <span className="font-bold">{style.name}</span>
                    {customization.style === style.name && <div className="bg-brand-teal text-white p-1 rounded-full"><Check size={14} /></div>}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-5 bg-brand-teal text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-teal-dark transition-all shadow-lg shadow-brand-teal/20 active:scale-95"
            >
              Confirm and Proceed
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
