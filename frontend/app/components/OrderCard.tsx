"use client";
import React, { memo } from "react";
import { Package, CheckCircle2, Truck, Clock, CreditCard, Download } from "lucide-react";

interface OrderCardProps {
  order: any;
  index: number;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusStyles: (status: string) => string;
  onRepay: (order: any) => void;
  onDownloadQR: (order: any) => void;
}

const OrderCard = memo(({ order, index, getStatusIcon, getStatusStyles, onRepay, onDownloadQR }: OrderCardProps) => {
  return (
    <div 
      className="bg-white rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-7 border border-slate-100 shadow-lg shadow-slate-200/40 hover:shadow-xl hover:shadow-teal-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8 group animate-in slide-in-from-bottom-12 fade-in fill-mode-both"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      <div className="flex items-start sm:items-center gap-4 sm:gap-6">
        
        {/* Pet Image / Icon Container */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-[1rem] sm:rounded-[1.25rem] p-2 flex-shrink-0 border border-slate-100 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center">
          {order.petId?.photo ? (
            <img 
              src={order.petId.photo} 
              alt="Pet"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-contain drop-shadow-sm" 
            />
          ) : (
            <Package size={36} className="text-slate-300 group-hover:text-teal-500/30 transition-colors" />
          )}
        </div>
        
        <div>
          <h4 className="text-xl sm:text-2xl font-black text-slate-900 mb-1 tracking-tight">
            {order.type.replace("_", " ")}
          </h4>
          <p className="text-slate-500 font-medium text-[13px] sm:text-sm">
            For Pet: <span className="text-teal-600 font-bold ml-1">{order.petId?.name}</span>
          </p>
          
          {order.type === "QR_BELT" && order.beltCustomization && (
            <div className="flex flex-wrap gap-2 mt-3">
               <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest bg-slate-100 border border-slate-200/60 px-2.5 py-1 rounded-lg text-slate-500">
                Color: {order.beltCustomization.color}
               </span>
               <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest bg-slate-100 border border-slate-200/60 px-2.5 py-1 rounded-lg text-slate-500">
                Style: {order.beltCustomization.style}
               </span>
            </div>
          )}
          <p className="text-slate-400 text-[10px] font-bold mt-3 sm:mt-4 uppercase tracking-widest">
            ID: {order._id.slice(-6)}
          </p>
        </div>
      </div>

      {/* Price, Status & Actions Segment */}
      <div className="flex flex-col md:items-end gap-4 border-t md:border-t-0 border-slate-100 pt-5 md:pt-0 shrink-0">
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto">
          <p className="text-2xl sm:text-3xl font-black text-slate-900">₹{order.amount}</p>
          
          {/* Dynamic Status Pill */}
          <div className={`flex items-center gap-1.5 mt-1 sm:mt-2 font-bold text-[10px] sm:text-xs uppercase tracking-widest px-3 py-1.5 rounded-full border ${getStatusStyles(order.status)}`}>
            {getStatusIcon(order.status)}
            <span>{order.status}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 w-full md:w-auto mt-2 md:mt-0">
          {order.status === "CREATED" && (
            <button 
              onClick={() => onRepay(order)}
              className="w-full md:w-auto bg-slate-900 text-white px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 hover:bg-slate-800 transition-all shadow-md active:scale-95 group/btn"
            >
              <CreditCard size={18} className="text-teal-400 group-hover/btn:scale-110 transition-transform" /> 
              Pay Now
            </button>
          )}

          {order.status === "PAID" && order.petId?.qrCode && (
            <button 
              onClick={() => onDownloadQR(order)}
              className="w-full md:w-auto bg-teal-500 text-white px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 hover:bg-teal-600 transition-all shadow-md shadow-teal-500/25 active:scale-95 group/btn"
            >
              <Download size={18} className="group-hover/btn:-translate-y-0.5 transition-transform" /> 
              Download QR
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

OrderCard.displayName = "OrderCard";

export default OrderCard;
