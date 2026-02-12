"use client";

import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import api from "@/app/lib/api";
import { getAdminToken, clearAdminToken } from "@/app/lib/adminAuth";
import { useRouter } from "next/navigation";

type DashboardResponse = {
  summary: {
    usersCount: number;
    petsCount: number;
    paidOrdersCount: number;
    totalRevenue: number;
  };
  chart: { label: string; total: number }[];
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const token = getAdminToken();
        const response = await api.get("/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data);
      } catch (err: unknown) {
        const axiosError = err as AxiosError<{ message?: string }>;
        if (axiosError.response?.status === 401) {
          clearAdminToken();
          router.replace("/admin/login");
          return;
        }
        setError(axiosError.response?.data?.message || "Failed to load dashboard");
      }
    };

    load();
  }, [router]);

  const max = useMemo(() => {
    const values = data?.chart.map((item) => item.total) || [];
    return Math.max(1, ...values);
  }, [data]);

  if (!data && !error) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

      {error ? <p className="rounded-md bg-rose-50 p-3 text-rose-700">{error}</p> : null}

      {data ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Users" value={data.summary.usersCount} />
            <StatCard label="Pets" value={data.summary.petsCount} />
            <StatCard label="Paid Orders" value={data.summary.paidOrdersCount} />
            <StatCard label="Revenue" value={`₹${data.summary.totalRevenue}`} />
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Last 6 Months Revenue</h2>
            <div className="flex h-64 items-end gap-4">
              {data.chart.map((item) => (
                <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-md bg-cyan-500 transition-all"
                    style={{ height: `${Math.max((item.total / max) * 180, 6)}px` }}
                    title={`₹${item.total}`}
                  />
                  <div className="text-sm font-medium text-slate-600">{item.label}</div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
