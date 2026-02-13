"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "@/app/components/admin/AdminSidebar";
import { getAdminToken } from "@/app/lib/adminAuth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const [token, setToken] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const storedToken = getAdminToken();
    setToken(storedToken);
    setIsChecking(false);
  }, []);

  useEffect(() => {
    if (!isChecking) {
      if (!isLoginPage && !token) {
        router.replace("/admin/login");
      }

      if (isLoginPage && token) {
        router.replace("/admin/dashboard");
      }
    }
  }, [isChecking, isLoginPage, router, token]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if ((!token && isChecking) || (!token && !isLoginPage)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        Checking admin session...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      <AdminSidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}