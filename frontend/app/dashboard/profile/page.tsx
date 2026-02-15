"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, User, Phone, MessageCircle, Mail, Save, ChevronLeft } from "lucide-react";
import Link from "next/link";
import api from "../../lib/api";
import Navbar from "../../components/Navbar";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    mobile: "",
    whatsapp: ""
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      alert("Please login to access this feature");
      router.push("/auth");
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
    <div className="min-h-screen bg-brand-beige text-brand-charcoal font-sans">
      <Navbar userName={formData.username} />

      <main className="max-w-2xl mx-auto p-6 min-h-[calc(100vh-theme(spacing.20)-theme(spacing.64))]">
        <div className="my-10">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-brand-charcoal/50 hover:text-brand-teal transition-colors mb-6 font-bold text-sm uppercase tracking-wider group">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-black text-brand-charcoal tracking-tight flex items-center gap-3">
             <User className="text-brand-teal" size={32} />
             Edit Profile
          </h1>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 border border-brand-sand/50 shadow-xl shadow-brand-sand/10 relative overflow-hidden">
          {/* Decor */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-teal/5 rounded-bl-[3rem]"></div>

          {success && (
            <div className="mb-8 p-4 bg-brand-lime/20 text-brand-charcoal rounded-2xl border border-brand-lime/30 font-bold text-center flex items-center justify-center gap-2 shadow-sm">
              <span className="text-xl">🎉</span> {success}
            </div>
          )}
          
          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
             {/* Email (Read Only) */}
             <div>
              <label className="block text-xs font-black uppercase tracking-wider text-brand-charcoal/40 mb-3 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-charcoal/30" size={20} />
                <input 
                  type="email"
                  value={formData.email}
                  readOnly
                  className="w-full pl-12 pr-4 py-4 bg-brand-beige/50 border border-brand-sand/50 rounded-2xl text-brand-charcoal/60 font-bold cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] font-bold text-brand-charcoal/30 mt-2 ml-1 uppercase tracking-wide">Cannot be changed</p>
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-brand-charcoal/40 mb-3 ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-charcoal/30 group-focus-within:text-brand-teal transition-colors" size={20} />
                <input 
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-brand-sand/50 rounded-2xl outline-none focus:ring-2 focus:ring-brand-teal text-brand-charcoal font-bold placeholder:font-medium placeholder:text-brand-charcoal/20 transition-all"
                  placeholder="Your Name"
                  required
                />
              </div>
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-brand-charcoal/40 mb-3 ml-1">Mobile Number</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-charcoal/30 group-focus-within:text-brand-teal transition-colors" size={20} />
                <input 
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-brand-sand/50 rounded-2xl outline-none focus:ring-2 focus:ring-brand-teal text-brand-charcoal font-bold placeholder:font-medium placeholder:text-brand-charcoal/20 transition-all"
                  placeholder="Mobile Number"
                  required
                />
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-brand-charcoal/40 mb-3 ml-1">WhatsApp Number</label>
              <div className="relative group">
                <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-charcoal/30 group-focus-within:text-brand-teal transition-colors" size={20} />
                <input 
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-brand-sand/50 rounded-2xl outline-none focus:ring-2 focus:ring-brand-teal text-brand-charcoal font-bold placeholder:font-medium placeholder:text-brand-charcoal/20 transition-all"
                  placeholder="WhatsApp Number"
                  required
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-brand-teal hover:bg-brand-teal-dark text-white font-bold py-5 rounded-2xl shadow-xl shadow-brand-teal/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 mt-4 group"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} className="group-hover:scale-110 transition-transform" /> Save Changes</>}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
