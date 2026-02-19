"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, MapPin, Loader2, ArrowRight } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import CustomAlert from "@/app/components/CustomAlert";

export default function AddressPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const petId = searchParams.get("petId");
  const type = searchParams.get("type");
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ message: string | null; type: "success" | "error" | "info" }>({ message: null, type: "info" });

  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: ""
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
    setLoading(true);

    // Store address in session storage to pass to next step
    sessionStorage.setItem("purchase_address", JSON.stringify(address));

    if (type === "QR_BELT") {
      router.push(`/purchase/customization?petId=${petId}&type=${type}`);
    } else {
      router.push(`/purchase/payment?petId=${petId}&type=${type}`);
    }
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

      {/* Constrained to max-w-lg to perfectly match the Profile page's compact layout */}
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
            Back to the dashboard
          </button>
          
          <div className="flex items-center gap-3">
             <div className="bg-teal-500 p-2 sm:p-2.5 rounded-xl shadow-sm shadow-teal-500/20 shrink-0">
               <MapPin className="text-white" size={20} strokeWidth={2.5} />
             </div>
             <h1 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-800 tracking-tight pb-1">
               Delivery Address
             </h1>
          </div>
        </div>

        {/* Address Form Card */}
        <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden animate-in slide-in-from-bottom-12 fade-in duration-700 delay-150 fill-mode-both w-full">
          
          {/* Subtle Decor Element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-teal-50 to-transparent rounded-bl-[3rem] opacity-60 pointer-events-none"></div>
          
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 relative z-10">
            
            {/* Street Address */}
            <div className="space-y-1.5">
              <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Street Address</label>
              <input 
                required 
                className="w-full px-4 py-3 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900 font-bold placeholder:font-medium placeholder:text-slate-400 transition-all text-sm hover:border-slate-300 focus:bg-white" 
                placeholder="Shop No, Building, Street" 
                value={address.street}
                onChange={(e) => setAddress({...address, street: e.target.value})}
              />
            </div>

            {/* City & State Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">City</label>
                <input 
                  required 
                  className="w-full px-4 py-3 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900 font-bold placeholder:font-medium placeholder:text-slate-400 transition-all text-sm hover:border-slate-300 focus:bg-white" 
                  placeholder="City" 
                  value={address.city}
                  onChange={(e) => setAddress({...address, city: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">State</label>
                <input 
                  required 
                  className="w-full px-4 py-3 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900 font-bold placeholder:font-medium placeholder:text-slate-400 transition-all text-sm hover:border-slate-300 focus:bg-white" 
                  placeholder="State" 
                  value={address.state}
                  onChange={(e) => setAddress({...address, state: e.target.value})}
                />
              </div>
            </div>

            {/* Pincode */}
            <div className="space-y-1.5">
              <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Pincode</label>
              <input 
                required 
                className="w-full px-4 py-3 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900 font-bold placeholder:font-medium placeholder:text-slate-400 transition-all text-sm hover:border-slate-300 focus:bg-white" 
                placeholder="6 digits" 
                value={address.zip}
                maxLength={6}
                onChange={(e) => setAddress({...address, zip: e.target.value})}
              />
            </div>

            {/* Dynamic Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3.5 sm:py-4 rounded-xl shadow-md shadow-teal-500/25 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2 mt-6 group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span className="text-sm sm:text-base">
                    {type === "QR_BELT" ? "Next: Customization" : "Proceed to Payment"}
                  </span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}