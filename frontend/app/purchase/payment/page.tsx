"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck, CreditCard, ChevronLeft } from "lucide-react";
import api from "@/app/lib/api";
import Navbar from "@/app/components/Navbar";
import CustomAlert from "@/app/components/CustomAlert";
import Script from "next/script";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const petId = searchParams.get("petId");
  const type = searchParams.get("type");
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ message: string | null; type: "success" | "error" | "info" }>({ message: null, type: "info" });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/auth");
      return;
    }
    setUser(JSON.parse(storedUser));
    setLoading(false);
  }, [router]);

  const handlePayment = async () => {
    try {
      const shippingAddress = JSON.parse(sessionStorage.getItem("purchase_address") || "{}");
      const beltCustomization = JSON.parse(sessionStorage.getItem("purchase_customization") || "null");

      if (type === "QR_BELT" && !shippingAddress.street) {
        setAlert({ message: "Shipping address missing. Going back.", type: "error" });
        setTimeout(() => router.push(`/purchase/address?petId=${petId}&type=${type}`), 2000);
        return;
      }

      setLoading(true);
      const { data } = await api.post("/order/create", {
        userId: user._id,
        petId,
        type,
        shippingAddress,
        beltCustomization
      });

      const { razorpayOrder, order } = data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY, 
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Pet Finder 🐾",
        description: `Order: ${type?.replace("_", " ")}`,
        order_id: razorpayOrder.id,
        handler: async (response: any) => {
          try {
            const verifyRes = await api.post("/order/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id
            });

            if (verifyRes.data.success) {
              setAlert({ message: "🎉 Payment Successful!", type: "success" });
              setTimeout(() => {
                router.push(`/purchase/success?petId=${petId}&type=${type}&orderId=${order._id}`);
              }, 1500);
            }
          } catch (err) {
            setAlert({ message: "Payment verification failed.", type: "error" });
            setLoading(false);
          }
        },
        prefill: {
          name: user.username,
          email: user.email,
          contact: user.mobile
        },
        theme: { color: "#14b8a6" }, // Updated to match Tailwind teal-500
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (error: any) {
      setAlert({ message: error.response?.data?.message || "Order initiation failed", type: "error" });
      setLoading(false);
    }
  };

  // Upgraded loader
  if (loading && !user) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-teal-500" size={48} strokeWidth={2.5} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-teal-200">
      <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert({ ...alert, message: null })} />
      <Navbar userName={user?.username} />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* Constrained to max-w-lg to match Address and Customization pages exactly */}
      <main className="max-w-lg mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 min-h-[calc(100vh-theme(spacing.20)-theme(spacing.64))] flex flex-col">
        
        {/* Animated Header Section - matches previous steps */}
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
               <ShieldCheck className="text-white" size={20} strokeWidth={2.5} />
             </div>
             <h1 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-800 tracking-tight pb-1">
               Secure Checkout
             </h1>
          </div>
        </div>

        {/* Payment Summary Card */}
        <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden animate-in slide-in-from-bottom-12 fade-in duration-700 delay-150 fill-mode-both w-full text-center">
          
          {/* Subtle Decor Element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-teal-50 to-transparent rounded-bl-[3rem] opacity-60 pointer-events-none"></div>

          <div className="space-y-6 sm:space-y-8 relative z-10">
            
            {/* Trust Indicator */}
            <div className="flex justify-center">
              <div className="bg-emerald-50 p-5 rounded-full border border-emerald-100 shadow-sm shadow-emerald-500/10">
                <ShieldCheck size={48} className="text-emerald-500" strokeWidth={2} />
              </div>
            </div>
            
            <div className="space-y-2.5">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Complete Payment</h2>
              <p className="text-slate-500 font-medium text-sm sm:text-base max-w-sm mx-auto leading-relaxed">
                Your transaction is secured with industry-standard encryption.
              </p>
            </div>

            {/* Receipt / Summary Box */}
            <div className="bg-slate-50 p-5 sm:p-6 rounded-2xl border border-slate-200 text-left shadow-inner shadow-slate-100/50">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200/60">
                <span className="font-bold text-slate-400 uppercase text-[10px] sm:text-[11px] tracking-widest">Item Summary</span>
                <span className="font-bold text-slate-700 text-sm">{type === "QR_BELT" ? "QR Tag + Premium Belt" : "QR Tag Only"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-400 uppercase text-[10px] sm:text-[11px] tracking-widest">Total Amount</span>
                <span className="font-black text-3xl text-teal-600 tracking-tight">₹{type === "QR_BELT" ? "299" : "50"}</span>
              </div>
            </div>

            {/* Main Action */}
            <button 
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 sm:py-4.5 rounded-xl shadow-md shadow-slate-900/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0 disabled:active:scale-100 flex items-center justify-center gap-2 group mt-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <CreditCard size={18} className="text-teal-400 group-hover:scale-110 transition-transform duration-300" /> 
                  <span className="text-sm sm:text-base">Pay Now</span>
                </>
              )}
            </button>

            {/* Footer Trust Mark */}
            <div className="flex items-center justify-center gap-2 pt-2 opacity-50">
              <ShieldCheck size={14} className="text-slate-400" />
              <p className="text-[9px] uppercase font-black tracking-widest text-slate-500">Secured by Razorpay</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}