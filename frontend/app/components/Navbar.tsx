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

  // Wrapper preserves layout space so content doesn't jump under the fixed navbar
  return (
    <header className="h-20 w-full z-50">
      <nav className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-xl border-b border-slate-200 transition-all duration-300 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-2 sm:gap-4">
            
            {/* Logo Section */}
            <Link href="/dashboard" className="flex items-center gap-3 group shrink-0">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-2xl overflow-hidden shadow-sm border border-slate-100 group-hover:shadow-md group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 ease-out">
                <img src="/logo.jpg" alt="PetFinder Logo" className="object-cover w-full h-full" />
              </div>
              <span className="text-xl sm:text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-500 tracking-tight hidden md:block transition-all">
                PetFinder
              </span>
            </Link>

            {/* Navigation Links - Centered & Responsive */}
            <div className="flex items-center justify-center flex-1 gap-1 sm:gap-2 md:gap-4">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-2.5 sm:px-4 sm:py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ease-in-out active:scale-95 ${
                      isActive
                        ? "bg-teal-500 text-white shadow-md shadow-teal-500/25 ring-1 ring-teal-500/50"
                        : "text-slate-600 hover:bg-slate-100 hover:text-teal-600"
                    }`}
                  >
                    <span className={`${isActive ? "text-white" : "text-slate-500 group-hover:text-teal-500"} transition-colors`}>
                      {link.icon}
                    </span>
                    {/* Text hides on mobile, shows on sm and up */}
                    <span className="hidden sm:block">{link.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Profile & Actions */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {userName ? (
                <>
                  <div className="hidden lg:flex items-center gap-2.5 px-4 py-2 bg-slate-50 rounded-full border border-slate-200 shadow-sm transition-all hover:shadow-md hover:bg-white cursor-default">
                    <div className="bg-teal-100 p-1 rounded-full">
                      <UserIcon size={14} className="text-teal-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{userName}</span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-2.5 sm:px-4 sm:py-2.5 flex items-center gap-2 text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white rounded-xl transition-all duration-300 active:scale-95 shadow-sm hover:shadow-rose-500/25 group"
                    title="Logout"
                  >
                    <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                    <span className="hidden sm:block font-semibold text-sm">Logout</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => router.push("/auth")}
                  className="bg-teal-500 text-white px-5 py-2.5 sm:px-7 sm:py-2.5 rounded-xl font-bold text-sm shadow-md shadow-teal-500/25 hover:bg-teal-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}