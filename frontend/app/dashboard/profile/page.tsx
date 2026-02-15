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
    <div className="min-h-screen bg-[#F5EFE6] text-[#2F2F2F]">
      <Navbar userName={formData.username} />

      <main className="max-w-2xl mx-auto p-6">
        <div className="my-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-[#5C5C5C] hover:text-[#1B9AAA] transition-colors mb-4 font-bold text-sm">
            <ChevronLeft size={16} /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-black text-[#2F2F2F] tracking-tight">Edit Profile</h1>
        </div>

        <div className="bg-white rounded-[2rem] p-8 border border-[#E6DCCD] shadow-lg shadow-teal-900/5">
          {success && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 font-medium text-center">
              {success}
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
             {/* Email (Read Only) */}
             <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#A3A3A3] mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3A3A3]" size={18} />
                <input 
                  type="email"
                  value={formData.email}
                  readOnly
                  className="w-full pl-12 pr-4 py-3 bg-[#F5EFE6]/50 border border-[#E6DCCD] rounded-xl text-[#5C5C5C] cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-[#A3A3A3] mt-2 ml-1">Email cannot be changed.</p>
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#A3A3A3] mb-2">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3A3A3] group-focus-within:text-[#1B9AAA] transition-colors" size={18} />
                <input 
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-[#E6DCCD] rounded-xl outline-none focus:ring-2 focus:ring-[#1B9AAA] transition-all"
                  placeholder="Your Name"
                  required
                />
              </div>
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#A3A3A3] mb-2">Mobile Number</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3A3A3] group-focus-within:text-[#1B9AAA] transition-colors" size={18} />
                <input 
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-[#E6DCCD] rounded-xl outline-none focus:ring-2 focus:ring-[#1B9AAA] transition-all"
                  placeholder="Mobile Number"
                  required
                />
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#A3A3A3] mb-2">WhatsApp Number</label>
              <div className="relative group">
                <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3A3A3] group-focus-within:text-[#1B9AAA] transition-colors" size={18} />
                <input 
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-[#E6DCCD] rounded-xl outline-none focus:ring-2 focus:ring-[#1B9AAA] transition-all"
                  placeholder="WhatsApp Number"
                  required
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-[#1B9AAA] hover:bg-teal-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save Changes</>}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
