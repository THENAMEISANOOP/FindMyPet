"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, User, Phone, MessageCircle, Mail, Save, ChevronLeft } from "lucide-react";
import Link from "next/link";
import api from "../../lib/api";
import Navbar from "../../components/Navbar";
import CustomAlert from "../../components/CustomAlert";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [alert, setAlert] = useState<{ message: string | null; type: "success" | "error" | "info" }>({ message: null, type: "info" });
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    mobile: "",
    whatsapp: ""
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      setAlert({ message: "Please login to access this feature", type: "info" });
      setTimeout(() => router.push("/auth"), 1500);
      return;
    }
    const user = JSON.parse(storedUser);
    setFormData({
      username: user.username || "",
      email: user.email || "",
      mobile: user.mobile || "",
      whatsapp: user.whatsapp || ""
    });
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { data } = await api.post("/auth/update", formData);
      if (data.success) {
        // Update local storage
        localStorage.setItem("user", JSON.stringify(data.user));
        setSuccess("Profile updated successfully!");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-teal-200">
      <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert({ ...alert, message: null })} />
      <Navbar userName={formData.username} />

      <main className="max-w-lg mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 min-h-[calc(100vh-theme(spacing.20)-theme(spacing.64))] flex flex-col">
        
        {/* Animated Header Section */}
        <div className="mb-6 sm:mb-8 animate-in slide-in-from-left-8 fade-in duration-700 shrink-0">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-teal-600 transition-colors mb-4 font-bold text-[11px] sm:text-xs uppercase tracking-widest group"
          >
            <div className="bg-slate-200/50 p-1.5 rounded-full group-hover:bg-teal-100 transition-colors">
              <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" strokeWidth={3} /> 
            </div>
            Back to Dashboard
          </Link>
          
          {/* Upgraded Gradient Heading Layout */}
          <div className="flex items-center gap-3">
             <div className="bg-teal-500 p-2 sm:p-2.5 rounded-xl shadow-sm shadow-teal-500/20 shrink-0">
               <User className="text-white" size={20} strokeWidth={2.5} />
             </div>
             <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-800 tracking-tight pb-1">
               Edit Profile
             </h1>
          </div>
        </div>

        {/* Profile Form Card */}
        <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden animate-in slide-in-from-bottom-12 fade-in duration-700 delay-150 fill-mode-both w-full">
          
          {/* Subtle Decor Element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-teal-50 to-transparent rounded-bl-[3rem] opacity-60 pointer-events-none"></div>

          {/* Feedback Messages */}
          {success && (
            <div className="mb-6 p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 font-bold text-sm text-center flex items-center justify-center gap-2 shadow-sm animate-in zoom-in-95 fade-in duration-300">
              <span className="text-lg">🎉</span> {success}
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 font-bold text-sm text-center animate-in zoom-in-95 fade-in duration-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 relative z-10">
            
            {/* Email (Read Only) */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email"
                  value={formData.email}
                  readOnly
                  className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-500 font-bold cursor-not-allowed transition-all text-sm shadow-inner shadow-slate-100/50"
                />
              </div>
              <p className="text-[9px] font-bold text-slate-400 mt-1.5 ml-1 uppercase tracking-widest">Cannot be changed</p>
            </div>

            {/* Username */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors duration-300" size={18} />
                <input 
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900 font-bold placeholder:font-medium placeholder:text-slate-400 transition-all text-sm hover:border-slate-300 focus:bg-white"
                  placeholder="Your Name"
                  required
                />
              </div>
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Mobile Number</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors duration-300" size={18} />
                <input 
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900 font-bold placeholder:font-medium placeholder:text-slate-400 transition-all text-sm hover:border-slate-300 focus:bg-white"
                  placeholder="Mobile Number"
                  required
                />
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 ml-1">WhatsApp Number</label>
              <div className="relative group">
                <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors duration-300" size={18} />
                <input 
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900 font-bold placeholder:font-medium placeholder:text-slate-400 transition-all text-sm hover:border-slate-300 focus:bg-white"
                  placeholder="WhatsApp Number"
                  required
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3.5 sm:py-4 rounded-xl shadow-md shadow-teal-500/25 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0 disabled:active:scale-100 flex items-center justify-center gap-2 mt-6 group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Save size={18} className="group-hover:scale-110 transition-transform duration-300" /> 
                  <span className="text-sm sm:text-base">Save Changes</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}