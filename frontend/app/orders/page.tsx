"use client";
import { useEffect, useState } from "react";
import { Loader2, ShoppingBag, Package, CheckCircle2, Clock, Truck, ChevronLeft, CreditCard } from "lucide-react";
import api from "../lib/api";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MyOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/auth");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchOrders(parsedUser._id);
  }, []);

  const fetchOrders = async (userId: string) => {
    try {
      const { data } = await api.get(`/order/my-orders?userId=${userId}`);
      if (data.success) setOrders(data.orders);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- REPAYMENT LOGIC ---
  const handleRepay = async (order: any) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
      amount: order.amount * 100, // Backend stores Rupees, Razorpay needs Paise
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
            alert("🎉 Payment Successful!");
            fetchOrders(user._id); // Refresh list to show 'PAID'
          }
        } catch (err) {
          alert("Verification failed.");
        }
      },
      prefill: {
        name: user.username,
        email: user.email,
        contact: user.mobile
      },
      theme: { color: "#2563eb" }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID": return <CheckCircle2 className="text-green-500" size={18} />;
      case "SHIPPED": return <Truck className="text-blue-500" size={18} />;
      default: return <Clock className="text-amber-500" size={18} />;
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar userName={user?.username} />

      <main className="max-w-4xl mx-auto p-6">
        <div className="my-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-4 font-bold text-sm">
            <ChevronLeft size={16} /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Order History</h1>
        </div>

        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order._id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0">
                  {order.petId?.photo ? <img src={order.petId.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><Package size={24} /></div>}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{order.type.replace("_", " ")}</h4>
                  <p className="text-slate-500 text-sm">Pet: {order.petId?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xl font-black text-slate-800">₹{order.amount}</p>
                  <div className="flex items-center gap-1 mt-1 font-bold text-xs uppercase tracking-tight">
                    {getStatusIcon(order.status)}
                    <span className={order.status === "PAID" ? "text-green-600" : "text-amber-600"}>{order.status}</span>
                  </div>
                </div>

                {/* --- THE REPAYMENT BUTTON --- */}
                {order.status === "CREATED" && (
                  <button 
                    onClick={() => handleRepay(order)}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                  >
                    <CreditCard size={16} /> Pay Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}