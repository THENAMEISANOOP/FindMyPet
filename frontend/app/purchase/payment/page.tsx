"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck, CreditCard, ChevronLeft, MapPin, Plus, Check } from "lucide-react";
import api from "@/app/lib/api";
import Navbar from "@/app/components/Navbar";
import CustomAlert from "@/app/components/CustomAlert";
import Script from "next/script";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const petId = searchParams.get("petId");
  const type = searchParams.get("type");
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ message: string | null; type: "success" | "error" | "info" }>({ message: null, type: "info" });

  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newAddress, setNewAddress] = useState({
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
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchSavedAddresses(parsedUser._id);
  }, [router]);

  const fetchSavedAddresses = async (userId: string) => {
    try {
      const { data } = await api.get(`/order/my-orders?userId=${userId}`);
      if (data.success && data.orders) {
        // Extract unique valid addresses from past orders
        const addresses: any[] = [];
        const seen = new Set();

        data.orders.forEach((order: any) => {
          if (order.shippingAddress && order.shippingAddress.street) {
            const addrString = JSON.stringify(order.shippingAddress);
            if (!seen.has(addrString)) {
              seen.add(addrString);
              addresses.push(order.shippingAddress);
            }
          }
        });

        setSavedAddresses(addresses);
        if (addresses.length > 0) {
          setSelectedAddress(addresses[0]); // Default to most recent
        } else {
          setIsAddingNew(true); // Default to add new if none exist
        }
      }
    } catch (err) {
      console.error("Failed to fetch addresses");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      const shippingAddress = isAddingNew ? newAddress : selectedAddress;
      const beltCustomization = JSON.parse(sessionStorage.getItem("purchase_customization") || "null");

      // Validation
      if (type === "QR_BELT") {
        if (!shippingAddress || !shippingAddress.street || !shippingAddress.zip) {
           setAlert({ message: "Please provide a valid shipping address.", type: "error" });
           return;
        }
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
        theme: { color: "#14b8a6" },
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

      <main className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 min-h-[calc(100vh-theme(spacing.20)-theme(spacing.64))] flex flex-col">
        
        {/* Header */}
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
               Checkout
             </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">

          {/* 1. SHIPPING ADDRESS SECTION */}
          {type === "QR_BELT" && (
             <div className="bg-white rounded-[1.5rem] p-6 sm:p-8 border border-slate-100 shadow-xl shadow-slate-200/50 animate-in slide-in-from-bottom-8 fade-in duration-700">
                <div className="flex items-center gap-3 mb-6">
                   <MapPin className="text-teal-500" size={20} />
                   <h2 className="text-lg font-black text-slate-900">Shipping Address</h2>
                </div>

                {!isAddingNew && savedAddresses.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      {savedAddresses.map((addr, idx) => (
                        <div 
                          key={idx}
                          onClick={() => setSelectedAddress(addr)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start justify-between group ${
                            selectedAddress === addr 
                              ? "border-teal-500 bg-teal-50/30 shadow-sm" 
                              : "border-slate-100 hover:border-teal-200 bg-slate-50/50"
                          }`}
                        >
                          <div>
                             <p className="font-bold text-slate-800 text-sm">{addr.street}</p>
                             <p className="text-xs text-slate-500 mt-0.5">{addr.city}, {addr.state} - {addr.zip}</p>
                          </div>
                          {selectedAddress === addr && <Check size={18} className="text-teal-600" />}
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => { setIsAddingNew(true); setSelectedAddress(null); }}
                      className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1.5 px-1 py-2"
                    >
                      <Plus size={14} /> Add New Address
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Street Address</label>
                      <input 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900 font-bold text-sm" 
                        placeholder="Shop No, Building, Street" 
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">City</label>
                        <input 
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900 font-bold text-sm" 
                          placeholder="City" 
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">State</label>
                        <input 
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900 font-bold text-sm" 
                          placeholder="State" 
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Pincode</label>
                       <input 
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900 font-bold text-sm" 
                          placeholder="6 digits" 
                          maxLength={6}
                          value={newAddress.zip}
                          onChange={(e) => setNewAddress({...newAddress, zip: e.target.value})}
                       />
                    </div>

                    {savedAddresses.length > 0 && (
                      <button 
                        onClick={() => { setIsAddingNew(false); setSelectedAddress(savedAddresses[0]); }}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600 mt-2"
                      >
                        Cancel & Select Saved Address
                      </button>
                    )}
                  </div>
                )}
             </div>
          )}

          {/* 2. PAYMENT SUMMARY */}
          <div className="bg-white rounded-[1.5rem] p-6 sm:p-8 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden animate-in slide-in-from-bottom-12 fade-in duration-700 delay-100 fill-mode-both">
             {/* Subtle Decor Element */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-teal-50 to-transparent rounded-bl-[3rem] opacity-60 pointer-events-none"></div>

             <div className="space-y-6 relative z-10 text-center">
                <div className="flex justify-between items-center bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-inner">
                  <span className="font-bold text-slate-500 text-xs sm:text-sm uppercase tracking-wide">Total to Pay</span>
                  <span className="font-black text-3xl text-teal-600 tracking-tight">₹{type === "QR_BELT" ? "299" : "50"}</span>
                </div>

                <button 
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-md shadow-slate-900/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <CreditCard size={18} className="text-teal-400 group-hover:scale-110 transition-transform duration-300" /> 
                      <span className="text-sm sm:text-base">Pay securely</span>
                    </>
                  )}
                </button>
                
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Secured by Razorpay • Cancellable before shipping
                </p>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-teal-500" size={48} strokeWidth={2.5} />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
