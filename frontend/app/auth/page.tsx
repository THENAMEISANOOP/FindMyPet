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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
      <motion.div layout className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Pet Finder 🐾</h1>
          <p className="text-slate-500 mt-2 font-medium">Fast & Secure Pet Recovery</p>
        </div>

        {error && (
          <motion.p initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm mb-6 text-center border border-red-100 font-semibold">
            {error}
          </motion.p>
        )}

        <AnimatePresence mode="wait">
          {/* LOGIN STEP */}
          {step === "email" && (
            <motion.div key="email" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}>
              <form onSubmit={handleCheckEmail} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-4 text-slate-400" size={18} />
                  <input required type="email" name="email" placeholder="Enter Email" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={formData.email} onChange={handleChange} />
                </div>
                <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50">
                  {loading ? <Loader2 className="animate-spin" /> : <>Continue <ArrowRight size={18} /></>}
                </button>
              </form>
              <div className="mt-6 text-center">
                <div className="text-slate-500 text-sm">Don't have an account? <button onClick={() => setStep("register")} className="text-blue-600 font-bold hover:underline">Register</button></div>
              </div>
            </motion.div>
          )}

          {/* REGISTER STEP */}
          {step === "register" && (
            <motion.div key="register" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-4 text-slate-400" size={18} />
                  <input required name="username" placeholder="Full Name" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" onChange={handleChange} />
                </div>
                
                {/* EDITABLE EMAIL FIELD */}
                <div className="relative">
                  <Mail className="absolute left-4 top-4 text-slate-400" size={18} />
                  <input required type="email" name="email" value={formData.email} placeholder="Email Address" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" onChange={handleChange} />
                </div>

                <div className="relative">
                  <Phone className="absolute left-4 top-4 text-slate-400" size={18} />
                  <input required name="mobile" placeholder="Mobile Number" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" onChange={handleChange} />
                </div>

                <div className="relative">
                  <MessageCircle className="absolute left-4 top-4 text-slate-400" size={18} />
                  <input required name="whatsapp" placeholder="WhatsApp Number" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" onChange={handleChange} />
                </div>

                <button disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex justify-center active:scale-95 disabled:opacity-50">
                  {loading ? <Loader2 className="animate-spin" /> : "Sign Up"}
                </button>
              </form>
              <div className="mt-6 text-center">
                <div className="text-slate-500 text-sm">Already a user? <button onClick={() => setStep("email")} className="text-blue-600 font-bold hover:underline">Login</button></div>
              </div>
            </motion.div>
          )}

           {/* OTP STEP */}
           {step === "otp" && (
            <motion.div key="otp" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <p className="text-slate-500 mb-6 text-sm font-medium">Verification code sent to <br/><span className="text-slate-800 font-bold">{formData.email}</span></p>
              <form onSubmit={handleVerifyOTP}>
                <input required maxLength={6} name="otp" placeholder="000000" className="w-full text-center text-3xl tracking-[0.5em] font-black py-5 bg-slate-50 border-2 border-slate-200 rounded-3xl outline-none focus:border-green-500 mb-4 transition-all" onChange={handleChange} />
                <button disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex justify-center disabled:opacity-50">
                  {loading ? <Loader2 className="animate-spin" /> : "Verify OTP"}
                </button>
              </form>
              
              <div className="mt-4">
                 {canResend ? (
                     <button type="button" onClick={handleResendOTP} disabled={loading} className="text-blue-600 font-bold hover:underline">
                        Resend OTP
                     </button>
                 ) : (
                     <p className="text-slate-400 text-sm">Resend OTP in {timer}s</p>
                 )}
              </div>

              <button onClick={() => setStep("email")} className="text-slate-500 text-sm font-medium hover:text-slate-800 mt-4 block mx-auto">Edit Email</button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}