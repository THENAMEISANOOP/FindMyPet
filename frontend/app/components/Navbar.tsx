"use client";
import { LogOut, PawPrint, ShoppingBag, User as UserIcon } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function Navbar({ userName }: { userName: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/auth");
  };

  const navLinks = [
    { name: "My Pets", href: "/dashboard", icon: <PawPrint size={18} /> },
    { name: "My Orders", href: "/orders", icon: <ShoppingBag size={18} /> },
    { name: "Profile", href: "/dashboard/profile", icon: <UserIcon size={18} /> },
  ];

  return (
    <nav className="bg-brand-beige border-b border-brand-sand sticky top-0 z-40 shadow-sm backdrop-blur-md bg-opacity-90">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm group-hover:rotate-6 transition-transform">
             <img src="/logo.jpg" alt="PetFinder Logo" className="object-cover w-full h-full" />
          </div>
          <span className="text-xl font-black text-brand-charcoal tracking-tight hidden sm:block">PetFinder</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="flex items-center gap-1 sm:gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                pathname === link.href 
                ? "bg-brand-teal text-white shadow-lg shadow-brand-teal/20" 
                : "text-brand-charcoal/60 hover:bg-white/50 hover:text-brand-teal"
              }`}
            >
              {link.icon}
              <span className="hidden xs:block">{link.name}</span>
            </Link>
          ))}
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-3">
          {userName ? (
            <>
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-brand-sand shadow-sm">
                 <UserIcon size={16} className="text-brand-teal" />
                 <span className="text-xs font-bold text-brand-charcoal">{userName}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2.5 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all active:scale-95"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <button
               onClick={() => router.push("/auth")}
               className="bg-brand-teal text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-brand-teal/20 hover:bg-brand-teal-dark transition-all active:scale-95"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}