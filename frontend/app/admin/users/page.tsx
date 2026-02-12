"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import { clearAdminToken, getAdminToken } from "@/app/lib/adminAuth";

type AdminUser = {
  _id: string;
  username: string;
  email: string;
  mobile: string;
  whatsapp: string;
  isVerified: boolean;
  petCount: number;
  paidOrders: number;
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const token = getAdminToken();
        const { data } = await api.get("/admin/users", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(data.users || []);
      } catch (err: unknown) {
        const axiosError = err as AxiosError<{ message?: string }>;
        if (axiosError.response?.status === 401) {
          clearAdminToken();
          router.replace("/admin/login");
          return;
        }
        setError(axiosError.response?.data?.message || "Failed to load users");
      }
    };

    load();
  }, [router]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">User list</h1>
      {error ? <p className="rounded-md bg-rose-50 p-3 text-rose-700">{error}</p> : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Mobile</th>
              <th className="px-4 py-3">Pets</th>
              <th className="px-4 py-3">Paid orders</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-cyan-700 hover:underline">
                  <Link href={`/admin/users/${user._id}`}>{user.username}</Link>
                </td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{user.mobile}</td>
                <td className="px-4 py-3">{user.petCount}</td>
                <td className="px-4 py-3">{user.paidOrders}</td>
                <td className="px-4 py-3">{user.isVerified ? "Verified" : "Not Verified"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
