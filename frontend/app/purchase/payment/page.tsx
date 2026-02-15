"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck, CreditCard } from "lucide-react";
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
        theme: { color: "#1B9AAA" },
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

  if (loading && !user) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-brand-beige text-brand-charcoal font-sans">
      <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert({ ...alert, message: null })} />
      <Navbar userName={user?.username} />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <main className="max-w-2xl mx-auto p-6 py-12 text-center">
        <div className="bg-white rounded-[3rem] p-12 shadow-xl border border-brand-sand/40 space-y-8">
          <div className="flex justify-center">
            <div className="bg-brand-teal/10 p-6 rounded-full text-brand-teal">
              <ShieldCheck size={64} />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-3xl font-black tracking-tight">Secure Payment</h1>
            <p className="text-brand-charcoal/60 font-medium max-w-sm mx-auto">
              Please complete the payment to process your order. Your transaction is secured with industry-standard encryption.
            </p>
          </div>

          <div className="bg-brand-beige/50 p-6 rounded-3xl border border-brand-sand/20 text-left">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-brand-charcoal/40 uppercase text-xs tracking-widest">Item</span>
              <span className="font-black text-brand-teal">{type === "QR_BELT" ? "QR Tag + Premium Belt" : "QR Tag Only"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-brand-charcoal/40 uppercase text-xs tracking-widest">Total Amount</span>
              <span className="font-black text-2xl text-brand-charcoal">₹{type === "QR_BELT" ? "299" : "50"}</span>
            </div>
          </div>

          <button 
            onClick={handlePayment}
            disabled={loading}
            className="w-full py-5 bg-brand-charcoal text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-brand-charcoal/20 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><CreditCard size={20} /> Pay Now</>}
          </button>

          <p className="text-[10px] uppercase font-black tracking-[0.2em] text-brand-charcoal/20">Powered by Razorpay</p>
        </div>
      </main>
    </div>
  );
}
