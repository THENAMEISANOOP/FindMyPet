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

  // Reset timer when re-entering OTP step
  useEffect(() => {
    if (step === "otp") {
       // Only reset if it was 0 or not running? Actually simplified: 
       // If we want fresh timer every time we enter "otp" step from "email", we can resetting in the transition.
       // But existing logic handles transition to "otp" in handleCheckEmail/handleRegister.
       // Let's add a comprehensive reset function.
    }
  }, [step]);
  
  // Actually, better to reset timer when WE send the OTP.
  // We can do this by coupling the setStep("otp") with setTimer(30).
  // But since I can't easily change the other functions in this single replace block without touching too much code,
  // I will use a useEffect that detects when step CHANGES to 'otp'.

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
      // Optional: success message "OTP Resent!"
    } catch (err: any) {
      setError("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-beige flex items-center justify-center p-4 font-sans text-brand-charcoal relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-brand-sand/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-teal/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <motion.div layout className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-8 border border-white/50 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-teal rounded-2xl mb-4 shadow-lg shadow-brand-teal/30 rotate-3">
             <span className="text-3xl">🐾</span>
          </div>
          <h1 className="text-3xl font-black text-brand-charcoal tracking-tight mb-2">PetFinder</h1>
          <p className="text-brand-charcoal/60 font-medium">Fast & Secure Pet Recovery</p>
        </div>

        {error && (
          <motion.p initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm mb-6 text-center border border-red-100 font-bold shadow-sm">
            {error}
          </motion.p>
        )}

        <AnimatePresence mode="wait">
          {/* LOGIN STEP */}
          {step === "email" && (
            <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <form onSubmit={handleCheckEmail} className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-charcoal/40 group-focus-within:text-brand-teal transition-colors" size={20} />
                  <input required type="email" name="email" placeholder="Enter Email Address" className="w-full pl-12 pr-4 py-4 bg-white border border-brand-sand/50 rounded-2xl outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal transition-all placeholder:text-brand-charcoal/30 font-medium" value={formData.email} onChange={handleChange} />
                </div>
                <button disabled={loading} className="w-full bg-brand-teal hover:bg-brand-teal-dark text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-brand-teal/20 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100">
                  {loading ? <Loader2 className="animate-spin" /> : <>Continue <ArrowRight size={20} /></>}
                </button>
              </form>
              <div className="mt-8 text-center">
                <div className="text-brand-charcoal/50 text-sm font-medium">New to PetFinder? <button onClick={() => setStep("register")} className="text-brand-teal font-black hover:underline ml-1">Create Account</button></div>
              </div>
            </motion.div>
          )}

          {/* REGISTER STEP */}
          {step === "register" && (
            <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-charcoal/40 group-focus-within:text-brand-teal transition-colors" size={20} />
                  <input required name="username" placeholder="Full Name" className="w-full pl-12 pr-4 py-3.5 bg-white border border-brand-sand/50 rounded-2xl outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal transition-all placeholder:text-brand-charcoal/30 font-medium" onChange={handleChange} />
                </div>
                
                {/* EDITABLE EMAIL FIELD */}
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-charcoal/40 group-focus-within:text-brand-teal transition-colors" size={20} />
                  <input required type="email" name="email" value={formData.email} placeholder="Email Address" className="w-full pl-12 pr-4 py-3.5 bg-white border border-brand-sand/50 rounded-2xl outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal transition-all placeholder:text-brand-charcoal/30 font-medium" onChange={handleChange} />
                </div>

                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-charcoal/40 group-focus-within:text-brand-teal transition-colors" size={20} />
                  <input required name="mobile" placeholder="Mobile Number" className="w-full pl-12 pr-4 py-3.5 bg-white border border-brand-sand/50 rounded-2xl outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal transition-all placeholder:text-brand-charcoal/30 font-medium" onChange={handleChange} />
                </div>

                <div className="relative group">
                  <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-charcoal/40 group-focus-within:text-brand-teal transition-colors" size={20} />
                  <input required name="whatsapp" placeholder="WhatsApp Number" className="w-full pl-12 pr-4 py-3.5 bg-white border border-brand-sand/50 rounded-2xl outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal transition-all placeholder:text-brand-charcoal/30 font-medium" onChange={handleChange} />
                </div>

                <button disabled={loading} className="w-full bg-brand-teal hover:bg-brand-teal-dark text-white font-bold py-4 rounded-2xl shadow-xl shadow-brand-teal/20 transition-all flex justify-center items-center gap-2 active:scale-95 disabled:opacity-50 mt-2">
                  {loading ? <Loader2 className="animate-spin" /> : "Join Now"}
                </button>
              </form>
              <div className="mt-6 text-center">
                <div className="text-brand-charcoal/50 text-sm font-medium">Already have an account? <button onClick={() => setStep("email")} className="text-brand-teal font-black hover:underline ml-1">Login</button></div>
              </div>
            </motion.div>
          )}

           {/* OTP STEP */}
           {step === "otp" && (
            <motion.div key="otp" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="mb-6">
                <p className="text-brand-charcoal/60 text-sm font-medium mb-1">Code sent onto</p>
                <p className="text-brand-charcoal font-bold text-lg">{formData.email}</p>
              </div>

              <form onSubmit={handleVerifyOTP}>
                <input required maxLength={6} name="otp" placeholder="000000" className="w-full text-center text-4xl tracking-[0.4em] font-black py-6 bg-white border-2 border-brand-sand/50 rounded-3xl outline-none focus:border-brand-lime focus:ring-4 focus:ring-brand-lime/20 mb-6 transition-all text-brand-charcoal placeholder:text-brand-charcoal/10" onChange={handleChange} />
                <button disabled={loading} className="w-full bg-brand-lime hover:bg-[#bce85b] text-brand-charcoal font-black py-4 rounded-2xl shadow-xl shadow-brand-lime/20 transition-all flex justify-center active:scale-95 disabled:opacity-50">
                  {loading ? <Loader2 className="animate-spin" /> : "VERIFY & LOGIN"}
                </button>
              </form>
              
              <div className="mt-6">
                 {canResend ? (
                     <button type="button" onClick={handleResendOTP} disabled={loading} className="text-brand-teal font-bold hover:underline">
                        Resend OTP
                     </button>
                 ) : (
                     <p className="text-brand-charcoal/40 text-sm font-medium">Resend OTP in <span className="text-brand-teal font-bold">{timer}s</span></p>
                 )}
              </div>

              <button onClick={() => setStep("email")} className="text-brand-charcoal/40 text-xs font-bold hover:text-brand-charcoal mt-8 uppercase tracking-wider transition-colors">Change Email</button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}