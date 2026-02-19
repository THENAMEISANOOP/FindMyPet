"use client";
import { PawPrint, Facebook, Twitter, Instagram, Mail } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
        
        {/* Brand Section */}
        <div className="space-y-5">
          <div className="flex items-center gap-3 group">
            <div className="bg-teal-500 p-2.5 rounded-2xl shadow-sm group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300">
               <PawPrint className="text-white" size={22} />
            </div>
            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-500 tracking-tight">
              PetFinder
            </span>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed font-medium pr-4">
            Helping you keep your furry friends safe including comprehensive recovery solutions.
          </p>
          <div className="flex gap-3 pt-2">
            {[Facebook, Twitter, Instagram].map((Icon, i) => (
              <button 
                key={i} 
                className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:bg-teal-500 hover:text-white hover:border-teal-500 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <Icon size={18} />
              </button>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold mb-6 text-slate-800 uppercase tracking-wider text-xs">Quick Links</h4>
          <ul className="space-y-3.5 text-sm font-medium text-slate-500">
            {['Home', 'About Us', 'Features', 'Pricing', 'Contact'].map((item) => (
              <li key={item}>
                <Link href="#" className="hover:text-teal-600 hover:translate-x-1 inline-block transition-transform duration-200">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-bold mb-6 text-slate-800 uppercase tracking-wider text-xs">Legal</h4>
          <ul className="space-y-3.5 text-sm font-medium text-slate-500">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Refund Policy'].map((item) => (
              <li key={item}>
                <Link href="#" className="hover:text-teal-600 hover:translate-x-1 inline-block transition-transform duration-200">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="font-bold mb-6 text-slate-800 uppercase tracking-wider text-xs">Stay Updated</h4>
          <p className="text-sm text-slate-500 mb-4 leading-relaxed">Join our community for pet safety tips.</p>
          <form className="flex gap-2">
            <input 
              type="email"
              placeholder="Email Address" 
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm flex-1 focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none shadow-sm transition-all"
            />
            <button 
              type="button"
              className="bg-teal-500 text-white p-3 rounded-xl hover:bg-teal-600 transition-all duration-300 shadow-md shadow-teal-500/25 active:scale-95 hover:-translate-y-0.5"
            >
              <Mail size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* Copyright Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-slate-200 text-center">
        <p className="text-sm font-medium text-slate-400">© {new Date().getFullYear()} PetFinder. All rights reserved.</p>
      </div>
    </footer>
  );
}