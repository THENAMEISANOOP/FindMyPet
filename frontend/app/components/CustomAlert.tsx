"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { useEffect } from "react";

type AlertType = "success" | "error" | "info";

interface AlertProps {
  message: string | null;
  type?: AlertType;
  onClose: () => void;
}

export default function CustomAlert({ message, type = "info", onClose }: AlertProps) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  // Upgraded to match the modern application aesthetic with cohesive soft backgrounds
  const alertStyles = {
    success: {
      wrapper: "bg-emerald-50/95 border-emerald-200 text-emerald-800 shadow-emerald-500/15",
      iconBg: "bg-emerald-100 text-emerald-600",
      icon: <CheckCircle2 size={18} strokeWidth={2.5} />,
    },
    error: {
      wrapper: "bg-rose-50/95 border-rose-200 text-rose-800 shadow-rose-500/15",
      iconBg: "bg-rose-100 text-rose-600",
      icon: <AlertCircle size={18} strokeWidth={2.5} />,
    },
    info: {
      wrapper: "bg-blue-50/95 border-blue-200 text-blue-800 shadow-blue-500/15",
      iconBg: "bg-blue-100 text-blue-600",
      icon: <Info size={18} strokeWidth={2.5} />,
    },
  };

  const currentStyle = alertStyles[type];

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          // Using x: "-50%" directly in Framer Motion prevents layout jumping during the animation
          initial={{ opacity: 0, y: -40, x: "-50%", scale: 0.95 }}
          animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
          exit={{ opacity: 0, y: -20, x: "-50%", scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={`fixed top-4 sm:top-8 left-1/2 z-[100] flex items-center gap-3 p-3 sm:px-4 sm:py-3 rounded-2xl shadow-xl border backdrop-blur-xl w-[calc(100%-2rem)] sm:w-auto sm:min-w-[320px] max-w-md ${currentStyle.wrapper}`}
        >
          {/* Icon wrapped in a subtle background circle for a premium look */}
          <div className={`p-1.5 rounded-full shrink-0 ${currentStyle.iconBg}`}>
            {currentStyle.icon}
          </div>
          
          <p className="font-semibold text-sm sm:text-[15px] flex-1 leading-snug">
            {message}
          </p>
          
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-black/5 rounded-full transition-colors shrink-0 active:scale-95"
            aria-label="Close alert"
          >
            <X size={16} strokeWidth={2.5} className="opacity-60 hover:opacity-100 transition-opacity" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}