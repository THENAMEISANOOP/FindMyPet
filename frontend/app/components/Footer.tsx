"use client";
import { PawPrint, Facebook, Twitter, Instagram, Mail } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-brand-sand/30 border-t border-brand-sand pt-16 pb-8 text-brand-charcoal">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Brand Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="bg-brand-teal p-2 rounded-xl">
               <PawPrint className="text-white" size={20} />
            </div>
            <span className="text-xl font-black text-brand-charcoal tracking-tight">PetFinder</span>
          </div>
          <p className="text-sm text-brand-charcoal/70 leading-relaxed font-medium">
            Helping you keep your furry friends safe including comprehensive recovery solutions.
          </p>
          <div className="flex gap-4 pt-2">
            {[Facebook, Twitter, Instagram].map((Icon, i) => (
              <button key={i} className="p-2 bg-brand-beige hover:bg-brand-teal hover:text-white rounded-full transition-all text-brand-teal">
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold mb-6 text-brand-teal uppercase tracking-wider text-xs">Quick Links</h4>
          <ul className="space-y-3 text-sm font-medium text-brand-charcoal/80">
            {['Home', 'About Us', 'Features', 'Pricing', 'Contact'].map((item) => (
              <li key={item}><Link href="#" className="hover:text-brand-teal transition-colors">{item}</Link></li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-bold mb-6 text-brand-teal uppercase tracking-wider text-xs">Legal</h4>
          <ul className="space-y-3 text-sm font-medium text-brand-charcoal/80">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Refund Policy'].map((item) => (
              <li key={item}><Link href="#" className="hover:text-brand-teal transition-colors">{item}</Link></li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="font-bold mb-6 text-brand-teal uppercase tracking-wider text-xs">Stay Updated</h4>
          <p className="text-xs text-brand-charcoal/70 mb-4">Join our community for pet safety tips.</p>
          <form className="flex gap-2">
            <input 
              placeholder="Email Address" 
              className="bg-white border-none rounded-xl px-4 py-3 text-sm flex-1 focus:ring-2 focus:ring-brand-teal outline-none shadow-sm"
            />
            <button className="bg-brand-teal text-white p-3 rounded-xl hover:bg-brand-teal-dark transition-colors shadow-lg shadow-brand-teal/20">
              <Mail size={18} />
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-16 pt-8 border-t border-brand-sand/50 text-center">
        <p className="text-xs font-bold text-brand-charcoal/40">© {new Date().getFullYear()} PetFinder. All rights reserved.</p>
      </div>
    </footer>
  );
}
