"use client";
import { useEffect, useState } from "react";
import { Plus, PawPrint, QrCode, Loader2, Camera, ShoppingBag, CreditCard } from "lucide-react";
import api from "../lib/api";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import CustomAlert from "@/app/components/CustomAlert";

export default function Dashboard() {
  const router = useRouter();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [alert, setAlert] = useState<{ message: string | null; type: "success" | "error" | "info" }>({ message: null, type: "info" });
  
  const [uploading, setUploading] = useState(false);
  const [petData, setPetData] = useState({ name: "", age: "", photo: null as File | null });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchPets(parsedUser._id);
    }
    setLoading(false);
  }, []);

  const checkAuth = () => {
    if (!user) {
      alert("Please login to access this feature");
      router.push("/auth");
      return false;
    }
    return true;
  };

  const fetchPets = async (userId: string) => {
    try {
      const { data } = await api.get(`/pet/my-pets?userId=${userId}`);
      setPets(data.pets);
    } catch (err) {
      console.error("Error fetching pets");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (petId: string, type: "QR_ONLY" | "QR_BELT") => {
    if (!checkAuth()) return;

    try {
      const { data } = await api.post("/order/create", {
        userId: user._id,
        petId,
        type
      });

      const { razorpayOrder, order } = data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY, 
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Pet Finder 🐾",
        description: `Order: ${type.replace("_", " ")}`,
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
              alert("🎉 Payment Successful! Your order has been placed.");
            }
          } catch (err) {
            alert("Payment verification failed.");
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

    } catch (error: any) {
      alert(error.response?.data?.message || "Order initiation failed");
    }
  };

  const handleCreatePet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkAuth()) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("userId", user._id);
    formData.append("name", petData.name);
    formData.append("age", petData.age);
    if (petData.photo) formData.append("photo", petData.photo);

    try {
      await api.post("/pet/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShowModal(false);
      fetchPets(user._id);
    } catch (err) {
      setAlert({ message: "Failed to create pet", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-brand-beige">
      <Loader2 className="animate-spin text-brand-teal" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-beige text-brand-charcoal font-sans">
      <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert({ ...alert, message: null })} />
      {/* 1. Integrated Navbar */}
      <Navbar userName={user?.username} />

      <main className="max-w-7xl mx-auto px-6 py-8 min-h-[calc(100vh-theme(spacing.20)-theme(spacing.64))]">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-brand-charcoal tracking-tight">My Pets</h2>
            <p className="text-brand-charcoal/50 font-medium">Manage your pets and their QR tags</p>
          </div>
          <button 
            onClick={() => { if(checkAuth()) setShowModal(true); }} 
            className="bg-brand-teal text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-teal-dark transition-all shadow-lg shadow-brand-teal/20 active:scale-95 w-full sm:w-auto justify-center"
          >
            <Plus size={18} />
            Add New Pet
          </button>
        </div>

        {/* Pet Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {pets.map((pet: any) => (
            <div key={pet._id} className="bg-white rounded-3xl overflow-hidden border border-brand-sand/40 hover:shadow-xl hover:border-brand-teal/20 hover:-translate-y-1 transition-all duration-300 group">
              <div className="h-48 bg-gradient-to-br from-brand-sand/10 to-brand-beige/50 relative overflow-hidden">
                {pet.photo ? (
                  <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PawPrint size={48} className="text-brand-sand/50" />
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-brand-sand/20">
                  <p className="text-[10px] font-bold text-brand-teal uppercase tracking-wide">{pet.age} Years</p>
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="text-xl font-black text-brand-charcoal mb-4">{pet.name}</h3>
                
                <div className="space-y-2">
                  <button 
                    onClick={() => {
                       const win = window.open();
                       win?.document.write(`<div style="display:flex;flex-direction:column;align-items:center;font-family:sans-serif;padding:40px;background:#F5EFE6;height:100vh;justify-content:center;">
                          <div style="background:white;padding:20px;border-radius:30px;box-shadow:0 20px 50px rgba(0,0,0,0.1);">
                            <img src="${pet.qrCode}" style="width:300px;border-radius:20px;"/>
                          </div>
                          <h1 style="margin-top:40px;color:#2F2F2F;font-weight:900;">Scan to find family of ${pet.name}</h1>
                       </div>`);
                    }}
                    className="w-full bg-brand-beige/50 text-brand-charcoal py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-brand-sand/30 transition-all group/qr"
                  >
                    <QrCode size={16} className="text-brand-charcoal/50 group-hover/qr:text-brand-teal transition-colors" /> View QR
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handlePayment(pet._id, "QR_ONLY")}
                      className="flex flex-col items-center justify-center p-3 bg-brand-charcoal hover:bg-black rounded-xl transition-all shadow-lg shadow-brand-charcoal/10 group/belt"
                    >
                      <ShoppingBag size={16} className="text-brand-lime mb-1 group-hover/tag:scale-110 transition-transform" />
                      <span className="text-[9px] font-bold text-white/60 uppercase tracking-wide mb-0.5">QR Tag</span>
                      <span className="text-sm font-black text-white">₹50</span>
                    </button>

                    <button 
                      onClick={() => handlePayment(pet._id, "QR_BELT")}
                      className="flex flex-col items-center justify-center p-3 bg-brand-charcoal hover:bg-black rounded-xl transition-all shadow-lg shadow-brand-charcoal/10 group/belt"
                    >
                      <CreditCard size={16} className="text-brand-lime mb-1 group-hover/belt:scale-110 transition-transform" />
                      <span className="text-[9px] font-bold text-white/60 uppercase tracking-wide mb-0.5">Belt</span>
                      <span className="text-sm font-black text-white">₹299</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Empty State */}
          {pets.length === 0 && !loading && (
             <button 
                onClick={() => { if(checkAuth()) setShowModal(true); }}
                className="bg-white rounded-3xl border-2 border-dashed border-brand-sand hover:border-brand-teal hover:bg-brand-teal/5 transition-all flex flex-col items-center justify-center gap-4 p-10 group min-h-[300px]"
             >
                <div className="bg-brand-sand/20 p-5 rounded-full group-hover:scale-110 transition-transform duration-500">
                   <Plus size={32} className="text-brand-sand group-hover:text-brand-teal transition-colors" />
                </div>
                <div className="text-center">
                   <h3 className="text-lg font-bold text-brand-charcoal mb-1">Add Your First Pet</h3>
                   <p className="text-sm text-brand-charcoal/50 font-medium">Register a pet to generate a QR tag</p>
                </div>
             </button>
          )}
        </div>
      </main>

      {/* Modal - Register Pet */}
      {showModal && (
        <div className="fixed inset-0 bg-brand-charcoal/60 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
            {/* Modal Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-lime/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>

            <h2 className="text-4xl font-black mb-8 text-brand-charcoal relative z-10">Add Pet 🐶</h2>
            <form onSubmit={handleCreatePet} className="space-y-6 relative z-10">
              <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/40 ml-2">Pet Name</label>
                 <input required className="w-full p-5 bg-brand-beige border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-teal text-brand-charcoal font-bold placeholder:font-medium placeholder:text-brand-charcoal/30" 
                  placeholder="e.g. Bruno" onChange={(e) => setPetData({...petData, name: e.target.value})} />
              </div>
              
              <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/40 ml-2">Pet Age</label>
                 <input required type="number" className="w-full p-5 bg-brand-beige border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-teal text-brand-charcoal font-bold placeholder:font-medium placeholder:text-brand-charcoal/30" 
                  placeholder="e.g. 2" onChange={(e) => setPetData({...petData, age: e.target.value})} />
              </div>
              
              <label className="w-full flex flex-col items-center px-4 py-10 bg-brand-beige text-brand-teal rounded-3xl border-2 border-dashed border-brand-sand cursor-pointer hover:bg-brand-sand/20 hover:border-brand-teal transition-all group">
                <div className="bg-white p-4 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                   <Camera size={32} />
                </div>
                <span className="text-sm font-bold text-brand-charcoal/60 truncate max-w-full px-4 group-hover:text-brand-charcoal transition-colors">
                  {petData.photo ? petData.photo.name : "Upload Pet Photo"}
                </span>
                <input type='file' className="hidden" accept="image/*" onChange={(e) => setPetData({...petData, photo: e.target.files?.[0] || null})} />
              </label>
              
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 font-bold text-brand-charcoal/50 hover:text-brand-charcoal hover:bg-brand-beige rounded-2xl transition-all">Cancel</button>
                <button disabled={uploading} type="submit" className="flex-[2] py-4 font-bold bg-brand-teal text-white rounded-2xl shadow-xl shadow-brand-teal/20 flex justify-center items-center hover:bg-brand-teal-dark transition-all active:scale-95 disabled:opacity-70">
                  {uploading ? <Loader2 className="animate-spin" /> : "Complete Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}