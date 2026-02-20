"use client";
import { useEffect, useState, useCallback } from "react";
import { Loader2, ShoppingBag, Package, CheckCircle2, Clock, Truck, ChevronLeft, CreditCard } from "lucide-react";
import api from "../lib/api";
import Navbar from "../components/Navbar";
import CustomAlert from "../components/CustomAlert";
import { useRouter } from "next/navigation";
import Link from "next/link";
import OrderCard from "../components/OrderCard";

export default function MyOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [alert, setAlert] = useState<{ message: string | null; type: "success" | "error" | "info" }>({ message: null, type: "info" });

  const fetchOrders = useCallback(async (userId: string) => {
    try {
      const { data } = await api.get(`/order/my-orders?userId=${userId}`);
      if (data.success) setOrders(data.orders);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      setAlert({ message: "Please login to access this feature", type: "info" });
      setTimeout(() => router.push("/auth"), 1500);
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchOrders(parsedUser._id);
  }, [router, fetchOrders]);

  const downloadQR = useCallback((order: any) => {
    if (!order.petId?.qrCode) return;
    const link = document.createElement("a");
    link.href = order.petId.qrCode;
    link.download = `${order.petId.name}_QR_Finder.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // --- REPAYMENT LOGIC ---
  const handleRepay = useCallback(async (order: any) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
      amount: order.amount * 100, 
      currency: "INR",
      name: "Pet Finder 🐾",
      description: `Repayment for ${order.type.replace("_", " ")}`,
      order_id: order.razorpayOrderId,
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
            if (user?._id) fetchOrders(user._id); 
          }
        } catch (err) {
          setAlert({ message: "Verification failed.", type: "error" });
        }
      },
      prefill: {
        name: user?.username,
        email: user?.email,
        contact: user?.mobile
      },
      theme: { color: "#14b8a6" }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  }, [user, fetchOrders]);

  // Upgraded dynamic styling helpers for statuses
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID": return <CheckCircle2 size={16} strokeWidth={2.5} />;
      case "SHIPPED": return <Truck size={16} strokeWidth={2.5} />;
      default: return <Clock size={16} strokeWidth={2.5} />;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "PAID": return "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm shadow-emerald-500/10";
      case "SHIPPED": return "bg-blue-50 text-blue-600 border-blue-200 shadow-sm shadow-blue-500/10";
      default: return "bg-amber-50 text-amber-600 border-amber-200 shadow-sm shadow-amber-500/10";
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-teal-500" size={48} strokeWidth={2.5} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-teal-200">
      <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert({ ...alert, message: null })} />
      <Navbar userName={user?.username} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 min-h-[calc(100vh-theme(spacing.20)-theme(spacing.64))] flex flex-col">
        
        {/* Animated Header Section */}
        <div className="mb-8 sm:mb-12 animate-in slide-in-from-left-8 fade-in duration-700 shrink-0">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-teal-600 transition-colors mb-4 font-bold text-[11px] sm:text-xs uppercase tracking-widest group"
          >
            <div className="bg-slate-200/50 p-1.5 rounded-full group-hover:bg-teal-100 transition-colors">
              <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" strokeWidth={3} /> 
            </div>
            Back to Dashboard
          </Link>
          
          <div className="flex items-center gap-3">
             <div className="bg-teal-500 p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-sm shadow-teal-500/20 shrink-0">
               <ShoppingBag className="text-white" size={24} strokeWidth={2.5} />
             </div>
             <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-800 tracking-tight pb-1">
               Order History
             </h1>
          </div>
        </div>

        <div className="space-y-6">
          {/* Animated Empty State */}
          {orders.length === 0 && (
             <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 shadow-sm animate-in zoom-in-95 fade-in duration-700 flex flex-col items-center justify-center">
                <div className="bg-slate-50 p-6 rounded-full mb-5 border border-slate-100">
                  <Package size={40} className="text-slate-300" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-1.5">No orders found</h3>
                <p className="text-sm text-slate-500 font-medium">Your purchase history will appear here once you place an order.</p>
             </div>
          )}

          {/* Upgraded Order Cards Loop */}
          {orders.map((order: any, index: number) => (
            <OrderCard 
              key={order._id}
              order={order}
              index={index}
              getStatusIcon={getStatusIcon}
              getStatusStyles={getStatusStyles}
              onRepay={handleRepay}
              onDownloadQR={downloadQR}
            />
          ))}
        </div>
      </main>
    </div>
  );
}