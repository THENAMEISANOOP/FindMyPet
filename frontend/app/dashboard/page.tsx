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
      setAlert({ message: "Please login to access this feature", type: "info" });
      setTimeout(() => router.push("/auth"), 1500);
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
      setAlert({ message: `🐾 ${petData.name} has been registered successfully!`, type: "success" });
      fetchPets(user._id);
    } catch (err) {
      setAlert({ message: "Failed to create pet", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-teal-500" size={48} strokeWidth={2.5} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-teal-200">
      <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert({ ...alert, message: null })} />
      <Navbar userName={user?.username} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 min-h-[calc(100vh-theme(spacing.20)-theme(spacing.64))]">
        
        {/* Animated Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
          <div className="space-y-1.5 animate-in slide-in-from-left-8 fade-in duration-700">
            <h2 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-800 tracking-tight pb-1">
              My Pets
            </h2>
            <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
              <span className="w-6 h-[2px] bg-teal-200 rounded-full hidden sm:block"></span>
              Manage your companions & recovery tags
            </p>
          </div>
          
          <button 
            onClick={() => { if(checkAuth()) setShowModal(true); }} 
            className="bg-teal-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2.5 hover:bg-teal-600 hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-300 active:scale-95 w-full sm:w-auto justify-center group animate-in slide-in-from-right-8 fade-in duration-700"
          >
            <div className="bg-white/20 p-1 rounded-full group-hover:rotate-90 transition-transform duration-500">
              <Plus size={16} strokeWidth={3} />
            </div>
            Add New Pet
          </button>
        </div>

        {/* Upgraded & Resized Pet Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pets.map((pet: any, index: number) => (
            <div 
              key={pet._id} 
              className="bg-white p-2.5 rounded-[1.5rem] border border-slate-100 shadow-md shadow-slate-200/50 hover:shadow-xl hover:shadow-teal-500/15 hover:-translate-y-1.5 transition-all duration-500 group relative animate-in slide-in-from-bottom-12 fade-in fill-mode-both flex flex-col"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              
              {/* Pet Image Container - Reduced height & fixed object-contain */}
              <div className="relative h-48 w-full rounded-[1rem] overflow-hidden bg-slate-50 border border-slate-100/50 flex items-center justify-center p-2 shrink-0">
                {pet.photo ? (
                  <img 
                    src={pet.photo} 
                    alt={pet.name} 
                    className="w-full h-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-700 ease-out" 
                  />
                ) : (
                  <PawPrint size={48} className="text-slate-200 group-hover:text-teal-500/20 group-hover:scale-110 transition-all duration-500" />
                )}

                {/* Floating Age Badge */}
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xl px-3 py-1 rounded-full shadow-sm border border-slate-100">
                  <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{pet.age} YRS</p>
                </div>
              </div>
              
              {/* Pet Details & Dynamic Actions - Reduced padding */}
              <div className="px-3 pt-5 pb-2 flex-1 flex flex-col">
                <h3 className="text-2xl font-black text-slate-900 mb-5 group-hover:text-teal-600 transition-colors duration-300 tracking-tight line-clamp-1">
                  {pet.name}
                </h3>
                
                <div className="grid grid-cols-2 gap-2.5 mt-auto">
                  <button 
                    onClick={() => router.push(`/purchase/payment?petId=${pet._id}&type=QR_ONLY`)}
                    className="flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-teal-500 border border-slate-100 hover:border-teal-500 rounded-2xl transition-all duration-300 group/btn active:scale-95"
                  >
                    <ShoppingBag size={18} className="text-slate-400 group-hover/btn:text-white mb-1.5 group-hover/btn:-translate-y-1 transition-all duration-300" />
                    <span className="text-[9px] font-bold text-slate-500 group-hover/btn:text-teal-100 uppercase tracking-widest mb-0.5">QR Tag</span>
                    <span className="text-sm font-black text-slate-800 group-hover/btn:text-white">₹50</span>
                  </button>

                  <button 
                    onClick={() => router.push(`/purchase/address?petId=${pet._id}&type=QR_BELT`)}
                    className="flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-teal-500 border border-slate-100 hover:border-teal-500 rounded-2xl transition-all duration-300 group/btn active:scale-95"
                  >
                    <CreditCard size={18} className="text-slate-400 group-hover/btn:text-white mb-1.5 group-hover/btn:-translate-y-1 transition-all duration-300" />
                    <span className="text-[9px] font-bold text-slate-500 group-hover/btn:text-teal-100 uppercase tracking-widest mb-0.5">Belt</span>
                    <span className="text-sm font-black text-slate-800 group-hover/btn:text-white">₹299</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Animated Empty State */}
          {pets.length === 0 && !loading && (
             <button 
                onClick={() => { if(checkAuth()) setShowModal(true); }}
                className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4 bg-white rounded-[1.5rem] border-2 border-dashed border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all duration-500 flex flex-col items-center justify-center gap-4 p-12 group min-h-[300px] active:scale-[0.98] animate-in zoom-in-95 fade-in duration-700"
             >
                <div className="bg-slate-50 p-5 rounded-full group-hover:bg-white group-hover:shadow-lg group-hover:shadow-teal-500/20 group-hover:scale-110 transition-all duration-500">
                   <Plus size={32} className="text-slate-300 group-hover:text-teal-500 transition-colors duration-500" />
                </div>
                <div className="text-center space-y-1.5">
                   <h3 className="text-xl font-extrabold text-slate-900">Add Your First Pet</h3>
                   <p className="text-sm text-slate-500 font-medium">Register a pet to generate a custom QR recovery tag.</p>
                </div>
             </button>
          )}
        </div>
      </main>

      {/* Modal - Register Pet */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2rem] p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Decor */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-teal-100 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 opacity-60"></div>

            <h2 className="text-2xl font-black mb-6 text-slate-900 relative z-10 tracking-tight">Add Pet <span className="text-xl">🐶</span></h2>
            
            <form onSubmit={handleCreatePet} className="space-y-5 relative z-10">
              <div className="space-y-1.5">
                 <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Pet Name</label>
                 <input required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900 font-bold placeholder:font-medium placeholder:text-slate-400 transition-all text-sm" 
                 placeholder="e.g. Bruno" onChange={(e) => setPetData({...petData, name: e.target.value})} />
              </div>
              
              <div className="space-y-1.5">
                 <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Pet Age</label>
                 <input required type="number" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900 font-bold placeholder:font-medium placeholder:text-slate-400 transition-all text-sm" 
                 placeholder="e.g. 2" onChange={(e) => setPetData({...petData, age: e.target.value})} />
              </div>
              
              <label className="w-full flex flex-col items-center px-4 py-8 bg-slate-50 text-teal-600 rounded-2xl border-2 border-dashed border-slate-300 cursor-pointer hover:bg-teal-50/50 hover:border-teal-500 transition-all duration-300 group">
                <div className="bg-white p-3.5 rounded-full shadow-sm mb-3 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                   <Camera size={24} className="text-teal-500" />
                </div>
                <span className="text-xs font-bold text-slate-500 truncate max-w-full px-4 group-hover:text-teal-700 transition-colors">
                  {petData.photo ? petData.photo.name : "Upload Pet Photo"}
                </span>
                <input type='file' className="hidden" accept="image/*" onChange={(e) => setPetData({...petData, photo: e.target.files?.[0] || null})} />
              </label>
              
              <div className="flex gap-3 sm:gap-4 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3.5 text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all active:scale-95">
                  Cancel
                </button>
                <button disabled={uploading} type="submit" className="flex-[2] py-3.5 text-sm font-bold bg-teal-500 text-white rounded-xl shadow-md shadow-teal-500/25 flex justify-center items-center hover:bg-teal-600 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0">
                  {uploading ? <Loader2 className="animate-spin" size={18} /> : "Complete Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}