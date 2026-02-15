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
      alert("Please login to access this feature");
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
      case "PAID": return <CheckCircle2 className="text-brand-teal" size={20} />;
      case "SHIPPED": return <Truck className="text-blue-500" size={20} />;
      default: return <Clock className="text-amber-500" size={20} />;
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-brand-beige"><Loader2 className="animate-spin text-brand-teal" size={48} /></div>;

  return (
    <div className="min-h-screen bg-brand-beige text-brand-charcoal font-sans">
      <Navbar userName={user?.username} />

      <main className="max-w-4xl mx-auto p-6 min-h-[calc(100vh-theme(spacing.20)-theme(spacing.64))]">
        <div className="my-10">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-brand-charcoal/50 hover:text-brand-teal transition-colors mb-6 font-bold text-sm uppercase tracking-wider group">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-black text-brand-charcoal tracking-tight flex items-center gap-3">
            <ShoppingBag className="text-brand-teal" size={32} />
            Order History
          </h1>
        </div>

        <div className="space-y-6">
          {orders.length === 0 && (
             <div className="text-center py-20 bg-white rounded-[2.5rem] border border-brand-sand/30 shadow-sm">
                <Package size={64} className="text-brand-sand mx-auto mb-4" />
                <p className="text-brand-charcoal/50 font-medium text-lg">No orders found yet.</p>
             </div>
          )}

          {orders.map((order: any) => (
            <div key={order._id} className="bg-white rounded-[2.5rem] p-8 border border-brand-sand/30 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-8 group">
              
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-brand-sand/20 rounded-2xl overflow-hidden flex-shrink-0 border border-brand-sand/30 group-hover:scale-105 transition-transform">
                  {order.petId?.photo ? <img src={order.petId.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-brand-sand"><Package size={32} /></div>}
                </div>
                <div>
                  <h4 className="text-xl font-black text-brand-charcoal mb-1">{order.type.replace("_", " ")}</h4>
                  <p className="text-brand-charcoal/50 font-medium text-sm">For Pet: <span className="text-brand-teal">{order.petId?.name}</span></p>
                  <p className="text-brand-charcoal/30 text-xs font-bold mt-2 uppercase tracking-wider">ID: {order._id.slice(-6)}</p>
                </div>
              </div>

              <div className="flex items-center gap-8 border-t md:border-t-0 border-brand-sand/20 pt-6 md:pt-0">
                <div className="text-right">
                  <p className="text-2xl font-black text-brand-charcoal">₹{order.amount}</p>
                  <div className={`flex items-center gap-1.5 mt-1 font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full w-fit ml-auto ${
                      order.status === "PAID" ? "bg-brand-teal/10 text-brand-teal" : "bg-brand-sand/30 text-brand-charcoal/60"
                  }`}>
                    {getStatusIcon(order.status)}
                    <span>{order.status}</span>
                  </div>
                </div>

                {/* --- THE REPAYMENT BUTTON --- */}
                {order.status === "CREATED" && (
                  <button 
                    onClick={() => handleRepay(order)}
                    className="bg-brand-charcoal text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-brand-charcoal/20 active:scale-95"
                  >
                    <CreditCard size={18} className="text-brand-lime" /> Pay Now
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