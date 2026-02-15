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
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="bg-blue-600 p-2 rounded-xl group-hover:rotate-12 transition-transform">
            <PawPrint className="text-white" size={24} />
          </div>
          <span className="text-xl font-black text-slate-800 tracking-tight hidden sm:block">PetFinder</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="flex items-center gap-1 sm:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                pathname === link.href 
                ? "bg-blue-50 text-blue-600" 
                : "text-slate-500 hover:bg-slate-50 hover:text-blue-500"
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
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                 <UserIcon size={14} className="text-slate-400" />
                 <span className="text-xs font-bold text-slate-700">{userName}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-95"
                title="Logout"
              >
                <LogOut size={22} />
              </button>
            </>
          ) : (
            <button
               onClick={() => router.push("/auth")}
               className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 transition-all active:scale-95"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}