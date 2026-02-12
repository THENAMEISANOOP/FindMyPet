"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAdminToken } from "@/app/lib/adminAuth";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/users", label: "User list" }
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    clearAdminToken();
    router.replace("/admin/login");
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-slate-900 px-4 py-6 text-slate-100">
      <div className="mb-8 text-xl font-semibold">Admin Panel</div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-cyan-500/20 text-cyan-200"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={logout}
        className="mt-auto rounded-md bg-rose-500 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-600"
      >
        Logout
      </button>
    </aside>
  );
}
