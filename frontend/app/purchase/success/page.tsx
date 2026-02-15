"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Download, Home, ShoppingBag, Loader2 } from "lucide-react";
import api from "@/app/lib/api";
import Navbar from "@/app/components/Navbar";
import CustomAlert from "@/app/components/CustomAlert";

export default function SuccessPage() {
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
    <div className="h-screen flex items-center justify-center bg-brand-beige">
      <Loader2 className="animate-spin text-brand-teal" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-beige text-brand-charcoal font-sans">
      <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert({ ...alert, message: null })} />
      <Navbar userName={user?.username} />

      <main className="max-w-4xl mx-auto p-6 py-12">
        <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-2xl border border-brand-sand/40 text-center relative overflow-hidden">
          {/* Confetti Decor */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-teal via-brand-lime to-brand-teal"></div>
          
          <div className="flex justify-center mb-8">
            <div className="bg-brand-lime/10 p-6 rounded-full text-brand-lime relative">
              <CheckCircle size={80} />
              <div className="absolute -top-2 -right-2 bg-white p-2 rounded-full shadow-md">
                 <span className="text-2xl">🎉</span>
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Payment Successful!</h1>
          <p className="text-brand-charcoal/60 font-medium text-lg mb-12 max-w-lg mx-auto">
            Your order for {pet?.name}'s {type === "QR_BELT" ? "Premium Belt" : "QR Tag"} has been confirmed.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-left">
            {/* QR Section */}
            <div className="bg-brand-beige/50 p-8 rounded-[2.5rem] border border-brand-sand/30 flex flex-col items-center">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-brand-charcoal/40 mb-6">Digital QR Code</h3>
              <div className="bg-white p-6 rounded-3xl shadow-xl mb-8 group relative">
                 {pet?.qrCode ? (
                   <img src={pet.qrCode} alt="Pet QR" className="w-48 h-48 rounded-xl" />
                 ) : (
                   <div className="w-48 h-48 flex items-center justify-center bg-brand-beige rounded-xl">
                      <Loader2 className="animate-spin text-brand-teal" />
                   </div>
                 )}
              </div>
              <button 
                onClick={downloadQR}
                className="flex items-center gap-3 bg-brand-charcoal text-white px-8 py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-95"
              >
                <Download size={20} /> Download PNG
              </button>
            </div>

            {/* Next Steps Section */}
            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-brand-charcoal/40 mb-4">What's Next?</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-4">
                    <div className="h-6 w-6 bg-brand-teal text-white rounded-full flex items-center justify-center text-xs font-bold mt-1 shrink-0">1</div>
                    <p className="font-bold text-brand-charcoal/80">Print or save the digital QR code instantly.</p>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="h-6 w-6 bg-brand-teal text-white rounded-full flex items-center justify-center text-xs font-bold mt-1 shrink-0">2</div>
                    <p className="font-bold text-brand-charcoal/80">
                      {type === "QR_BELT" 
                        ? "We'll prepare your customized belt and ship it within 2-3 business days." 
                        : "Your digital QR code is ready! Print it or save it for instant use."}
                    </p>
                  </li>
                  {type === "QR_BELT" && (
                    <li className="flex items-start gap-4">
                      <div className="h-6 w-6 bg-brand-teal text-white rounded-full flex items-center justify-center text-xs font-bold mt-1 shrink-0">3</div>
                      <p className="font-bold text-brand-charcoal/80">Track your package delivery status from your orders page.</p>
                    </li>
                  )}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={() => router.push("/dashboard")}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand-beige border border-brand-sand p-4 rounded-xl font-bold hover:bg-brand-sand/50 transition-all font-black text-sm uppercase tracking-wide"
                >
                  <Home size={18} /> Dashboard
                </button>
                <button 
                  onClick={() => router.push("/orders")}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand-teal/10 text-brand-teal p-4 rounded-xl font-bold hover:bg-brand-teal/20 transition-all font-black text-sm uppercase tracking-wide"
                >
                  <ShoppingBag size={18} /> My Orders
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
