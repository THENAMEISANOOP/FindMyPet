"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, User, MessageCircle, ArrowRight, Loader2 } from "lucide-react";
import api from "../lib/api";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "register" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    mobile: "",
    whatsapp: "",
    otp: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  // Step 1: Check Email
  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/check-email", { email: formData.email });
      if (data.exists) {
        await api.post("/auth/login", { email: formData.email });
        setStep("otp");
      } else {
        setStep("register");
      }
    } catch (err: any) {
      setError("Server connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Register New User
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/register", {
        username: formData.username,
        email: formData.email, 
        mobile: formData.mobile,
        whatsapp: formData.whatsapp
      });
      // After registration, your backend flow requires OTP login
      await api.post("/auth/login", { email: formData.email });
      setStep("otp");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/verify-otp", {
        email: formData.email,
        otp: formData.otp
      });
      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid or Expired OTP");
    } finally {
      setLoading(false);
    }
  };

  // --- Timer Logic (New) ---
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Start timer when entering OTP step
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  useEffect(() => {
      if(step === 'otp') {
          setTimer(30);
          setCanResend(false);
      }
  }, [step]);

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      await api.post("/auth/login", { email: formData.email });
      setTimer(30);
      setCanResend(false);
      setError(""); // clear any previous errors
    } catch (err: any) {
      setError("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans text-slate-800 relative overflow-hidden selection:bg-teal-200">
      
      {/* Premium Background Decor */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

      <motion.div 
        layout 
        className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-white p-6 sm:p-10 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-teal-500 rounded-2xl mb-5 shadow-lg shadow-teal-500/25 rotate-3 hover:rotate-6 transition-transform duration-300">
             <span className="text-2xl sm:text-3xl drop-shadow-sm">🐾</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">PetFinder</h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base">Fast & Secure Pet Recovery</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm mb-6 text-center border border-rose-100 font-bold shadow-sm"
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* LOGIN STEP */}
          {step === "email" && (
            <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <form onSubmit={handleCheckEmail} className="space-y-5">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors duration-300" size={20} />
                  <input 
                    required 
                    type="email" 
                    name="email" 
                    placeholder="Enter Email Address" 
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 hover:border-slate-300 focus:bg-white transition-all placeholder:text-slate-400 font-bold text-slate-900" 
                    value={formData.email} 
                    onChange={handleChange} 
                  />
                </div>
                <button 
                  disabled={loading} 
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-teal-500/25 transition-all active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0 group"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <>Continue <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
                </button>
              </form>
              <div className="mt-8 text-center">
                <div className="text-slate-500 text-sm font-medium">
                  New to PetFinder? 
                  <button onClick={() => setStep("register")} className="text-teal-600 font-black hover:text-teal-700 hover:underline ml-1.5 transition-colors">Create Account</button>
                </div>
              </div>
            </motion.div>
          )}

          {/* REGISTER STEP */}
          {step === "register" && (
            <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors duration-300" size={18} />
                  <input required name="username" placeholder="Full Name" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 hover:border-slate-300 focus:bg-white transition-all placeholder:text-slate-400 font-bold text-slate-900 text-sm" onChange={handleChange} />
                </div>
                
                {/* EDITABLE EMAIL FIELD */}
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors duration-300" size={18} />
                  <input required type="email" name="email" value={formData.email} placeholder="Email Address" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 hover:border-slate-300 focus:bg-white transition-all placeholder:text-slate-400 font-bold text-slate-900 text-sm" onChange={handleChange} />
                </div>

                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors duration-300" size={18} />
                  <input required name="mobile" placeholder="Mobile Number" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 hover:border-slate-300 focus:bg-white transition-all placeholder:text-slate-400 font-bold text-slate-900 text-sm" onChange={handleChange} />
                </div>

                <div className="relative group">
                  <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors duration-300" size={18} />
                  <input required name="whatsapp" placeholder="WhatsApp Number" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 hover:border-slate-300 focus:bg-white transition-all placeholder:text-slate-400 font-bold text-slate-900 text-sm" onChange={handleChange} />
                </div>

                <button disabled={loading} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3.5 rounded-xl shadow-md shadow-teal-500/25 transition-all flex justify-center items-center gap-2 active:scale-95 disabled:opacity-70 mt-4">
                  {loading ? <Loader2 className="animate-spin" size={20} /> : "Join Now"}
                </button>
              </form>
              <div className="mt-6 text-center">
                <div className="text-slate-500 text-sm font-medium">
                  Already have an account? 
                  <button onClick={() => setStep("email")} className="text-teal-600 font-black hover:text-teal-700 hover:underline ml-1.5 transition-colors">Login</button>
                </div>
              </div>
            </motion.div>
          )}

           {/* OTP STEP */}
           {step === "otp" && (
            <motion.div key="otp" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="mb-6">
                <p className="text-slate-500 text-sm font-medium mb-1">Code sent onto</p>
                <p className="text-slate-900 font-extrabold text-lg">{formData.email}</p>
              </div>

              <form onSubmit={handleVerifyOTP}>
                <input 
                  required 
                  maxLength={6} 
                  name="otp" 
                  placeholder="000000" 
                  className="w-full text-center text-4xl tracking-[0.4em] font-black py-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 mb-6 transition-all text-slate-900 placeholder:text-slate-300 pl-[0.4em]" 
                  onChange={handleChange} 
                />
                <button 
                  disabled={loading} 
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-md shadow-slate-900/20 transition-all flex justify-center active:scale-95 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : "VERIFY & LOGIN"}
                </button>
              </form>
              
              <div className="mt-6">
                 {canResend ? (
                     <button type="button" onClick={handleResendOTP} disabled={loading} className="text-teal-600 font-bold hover:text-teal-700 hover:underline transition-colors">
                        Resend OTP
                     </button>
                 ) : (
                     <p className="text-slate-400 text-sm font-medium">Resend OTP in <span className="text-teal-600 font-bold">{timer}s</span></p>
                 )}
              </div>

              <button 
                onClick={() => setStep("email")} 
                className="text-slate-400 text-xs font-bold hover:text-slate-700 mt-8 uppercase tracking-widest transition-colors"
              >
                Change Email
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}