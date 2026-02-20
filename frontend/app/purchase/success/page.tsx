"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Download, Home, ShoppingBag, Loader2 } from "lucide-react";
import api from "@/app/lib/api";
import Navbar from "@/app/components/Navbar";
import CustomAlert from "@/app/components/CustomAlert";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const petId = searchParams.get("petId");
  const type = searchParams.get("type");
  
  const [user, setUser] = useState<any>(null);
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ message: string | null; type: "success" | "error" | "info" }>({ message: null, type: "info" });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/auth");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    
    if (petId) {
      fetchPetDetails(petId);
    }
  }, [petId, router]);

  const fetchPetDetails = async (id: string) => {
    try {
      const { data } = await api.get(`/pet/my-pets?userId=${user?._id || JSON.parse(localStorage.getItem("user")!)._id}`);
      const currentPet = data.pets.find((p: any) => p._id === id);
      setPet(currentPet);
    } catch (err) {
      console.error("Error fetching pet details");
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!pet?.qrCode) return;
    const link = document.createElement("a");
    link.href = pet.qrCode;
    link.download = `${pet.name}_QR_Finder.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-teal-500" size={48} strokeWidth={2.5} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-teal-200 overflow-x-hidden">
      <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert({ ...alert, message: null })} />
      <Navbar userName={user?.username} />

      {/* Tightly constrained max-w-[450px] for a perfect compact app-like card */}
      <main className="max-w-[450px] mx-auto w-full px-4 sm:px-6 py-8 min-h-[calc(100vh-theme(spacing.20))] flex flex-col justify-center pb-12">
        
        <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 text-center relative overflow-hidden animate-in slide-in-from-bottom-12 fade-in duration-700 w-full">
          
          {/* Confetti / Success Decor Bar */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-600"></div>
          
          {/* Success Icon */}
          <div className="flex justify-center mb-5 sm:mb-6">
            <div className="bg-emerald-50 p-4 rounded-full text-emerald-500 relative shadow-sm shadow-emerald-500/20 border border-emerald-100 animate-in zoom-in-50 duration-500 delay-150">
              <CheckCircle size={48} strokeWidth={2} />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 tracking-tight text-slate-900">
            Payment Successful!
          </h1>
          <p className="text-slate-500 font-medium text-xs sm:text-sm mb-6 px-2">
            Your order for <span className="text-teal-600 font-bold">{pet?.name}'s</span> {type === "QR_BELT" ? "Premium Belt" : "QR Tag"} is confirmed.
          </p>

          <div className="flex flex-col gap-6 text-left relative z-10">
            
            {/* Compact QR Section */}
            <div className="bg-slate-50 p-4 rounded-[1.25rem] border border-slate-100 flex items-center gap-4 sm:gap-5 shadow-inner shadow-slate-100/50">
              <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100 shrink-0">
                 {pet?.qrCode ? (
                   <img src={pet.qrCode} alt="Pet QR" className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-contain" />
                 ) : (
                   <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center bg-slate-50 rounded-lg">
                      <Loader2 className="animate-spin text-teal-500" size={24} />
                   </div>
                 )}
              </div>
              
              <div className="flex flex-col justify-center flex-1">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5">
                  Digital QR Code
                </h3>
                <button 
                  onClick={downloadQR}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-3 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95 group/btn"
                >
                  <Download size={14} className="text-teal-400 group-hover/btn:-translate-y-0.5 transition-transform" /> 
                  <span className="text-xs sm:text-sm">Download</span>
                </button>
              </div>
            </div>

            {/* Next Steps Section */}
            <div className="px-1">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 pl-1">
                What's Next?
              </h3>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-3.5">
                  <div className="h-6 w-6 bg-teal-100 text-teal-700 border border-teal-200 rounded-full flex items-center justify-center text-[10px] font-black mt-0.5 shrink-0 shadow-sm">1</div>
                  <p className="font-semibold text-slate-700 text-xs sm:text-sm leading-relaxed">
                    Print or save the digital QR code instantly.
                  </p>
                </li>
                <li className="flex items-start gap-3.5">
                  <div className="h-6 w-6 bg-teal-100 text-teal-700 border border-teal-200 rounded-full flex items-center justify-center text-[10px] font-black mt-0.5 shrink-0 shadow-sm">2</div>
                  <p className="font-semibold text-slate-700 text-xs sm:text-sm leading-relaxed">
                    {type === "QR_BELT" 
                      ? "We'll prepare your customized belt and ship it within 2-3 business days." 
                      : "Your digital QR code is ready! Print it or save it for instant use."}
                  </p>
                </li>
                {type === "QR_BELT" && (
                  <li className="flex items-start gap-3.5">
                    <div className="h-6 w-6 bg-teal-100 text-teal-700 border border-teal-200 rounded-full flex items-center justify-center text-[10px] font-black mt-0.5 shrink-0 shadow-sm">3</div>
                    <p className="font-semibold text-slate-700 text-xs sm:text-sm leading-relaxed">
                      Track your package delivery status from your orders page.
                    </p>
                  </li>
                )}
              </ul>
            </div>

            {/* Action Buttons Container */}
            <div className="flex gap-3 pt-2 mt-2 border-t border-slate-100/80">
              <button 
                onClick={() => router.push("/dashboard")}
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 p-3 sm:p-3.5 rounded-xl font-bold hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95 text-[10px] sm:text-xs uppercase tracking-widest"
              >
                <Home size={14} /> Dashboard
              </button>
              <button 
                onClick={() => router.push("/orders")}
                className="flex-1 flex items-center justify-center gap-2 bg-teal-50 border border-teal-100 text-teal-700 p-3 sm:p-3.5 rounded-xl font-bold hover:bg-teal-100 transition-all active:scale-95 text-[10px] sm:text-xs uppercase tracking-widest"
              >
                <ShoppingBag size={14} /> Orders
              </button>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-teal-500" size={48} strokeWidth={2.5} />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
