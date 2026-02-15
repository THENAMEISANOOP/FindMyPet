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

  const colors = {
    success: "bg-brand-lime text-brand-charcoal border-brand-lime/50",
    error: "bg-red-50 text-red-600 border-red-100",
    info: "bg-blue-50 text-blue-600 border-blue-100",
  };

  const icons = {
    success: <CheckCircle2 size={20} />,
    error: <AlertCircle size={20} />,
    info: <Info size={20} />,
  };

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md ${colors[type]} min-w-[300px] max-w-md`}
        >
          {icons[type]}
          <p className="font-bold text-sm flex-1">{message}</p>
          <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full transition-colors">
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
