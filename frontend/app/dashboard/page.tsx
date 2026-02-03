"use client";
import { useEffect, useState } from "react";
import { Plus, PawPrint, QrCode, Loader2, Camera, ShoppingBag, CreditCard } from "lucide-react";
import api from "../lib/api";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

export default function Dashboard() {
  const router = useRouter();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  
  const [uploading, setUploading] = useState(false);
  const [petData, setPetData] = useState({ name: "", age: "", photo: null as File | null });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/auth");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchPets(parsedUser._id);
  }, []);

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
      alert("Failed to create pet");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* 1. Integrated Navbar */}
      <Navbar userName={user?.username} />

      <main className="max-w-6xl mx-auto p-6">
        {/* New Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center my-10 gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">My Pets</h2>
            <p className="text-slate-500 font-medium">Manage your pets and their security tags</p>
          </div>
          <button 
            onClick={() => setShowModal(true)} 
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 w-full sm:w-auto justify-center"
          >
            <Plus size={20} /> Add New Pet
          </button>
        </div>

        {/* Pet Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pets.map((pet: any) => (
            <div key={pet._id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-2xl transition-all duration-300">
              <div className="h-56 bg-slate-100 relative">
                {pet.photo ? (
                  <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300"><PawPrint size={64} /></div>
                )}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full shadow-sm">
                  <p className="text-xs font-black text-blue-600 uppercase tracking-wider">{pet.age} Years Old</p>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-2xl font-bold text-slate-800 mb-6">{pet.name}</h3>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => {
                       const win = window.open();
                       win?.document.write(`<div style="display:flex;flex-direction:column;align-items:center;font-family:sans-serif;padding:40px;">
                          <img src="${pet.qrCode}" style="width:300px;border:10px solid black;padding:10px;border-radius:20px;"/>
                          <h1 style="margin-top:20px;">Scan to find family of ${pet.name}</h1>
                       </div>`);
                    }}
                    className="w-full bg-slate-100 text-slate-700 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
                  >
                    <QrCode size={18} /> View QR Code
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handlePayment(pet._id, "QR_ONLY")}
                      className="flex flex-col items-center justify-center p-3 border-2 border-blue-50 hover:border-blue-200 hover:bg-blue-50 rounded-2xl transition-all group"
                    >
                      <ShoppingBag size={18} className="text-blue-500 mb-1" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase">QR Tag</span>
                      <span className="text-sm font-black text-slate-800">₹50</span>
                    </button>

                    <button 
                      onClick={() => handlePayment(pet._id, "QR_BELT")}
                      className="flex flex-col items-center justify-center p-3 bg-blue-600 hover:bg-blue-700 rounded-2xl transition-all shadow-lg shadow-blue-100"
                    >
                      <CreditCard size={18} className="text-white mb-1" />
                      <span className="text-[10px] font-bold text-blue-200 uppercase">Premium Belt</span>
                      <span className="text-sm font-black text-white">₹299</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal - Register Pet */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
            <h2 className="text-3xl font-black mb-8 text-slate-800">Add Pet 🐶</h2>
            <form onSubmit={handleCreatePet} className="space-y-5">
              <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900" 
                placeholder="Pet Name" onChange={(e) => setPetData({...petData, name: e.target.value})} />
              
              <input required type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900" 
                placeholder="Age" onChange={(e) => setPetData({...petData, age: e.target.value})} />
              
              <label className="w-full flex flex-col items-center px-4 py-8 bg-slate-50 text-blue-500 rounded-2xl border-2 border-dashed border-slate-200 cursor-pointer hover:bg-blue-50 transition-all">
                <Camera size={28} />
                <span className="mt-2 text-sm font-bold text-slate-600 truncate max-w-full px-4">
                  {petData.photo ? petData.photo.name : "Upload Pet Photo"}
                </span>
                <input type='file' className="hidden" accept="image/*" onChange={(e) => setPetData({...petData, photo: e.target.files?.[0] || null})} />
              </label>
              
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 font-bold text-slate-400">Cancel</button>
                <button disabled={uploading} type="submit" className="flex-1 py-4 font-bold bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-200 flex justify-center items-center">
                  {uploading ? <Loader2 className="animate-spin" /> : "Register"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}