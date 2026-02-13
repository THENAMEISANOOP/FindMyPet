"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "@/app/components/admin/AdminSidebar";
import { getAdminToken } from "@/app/lib/adminAuth";

const subscribe = () => () => {};
const getServerSnapshot = () => false;
const getClientSnapshot = () => Boolean(getAdminToken());

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const hasToken = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  useEffect(() => {
    if (!isLoginPage && !hasToken) {
      router.replace("/admin/login");
    }

    if (isLoginPage && hasToken) {
      router.replace("/admin/dashboard");
    }
  }, [hasToken, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!hasToken) {
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
