"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import api from "@/app/lib/api";
import { clearAdminToken, getAdminToken } from "@/app/lib/adminAuth";

type Pet = {
  _id: string;
  name: string;
  age?: number;
  photo?: string;
};

type Order = {
  _id: string;
  petId: string;
  type: "QR_ONLY" | "QR_BELT";
  amount: number;
  status: "CREATED" | "PAID" | "SHIPPED";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
};

type UserDetailsResponse = {
  user: {
    username: string;
    email: string;
    mobile: string;
    whatsapp: string;
  };
  pets: Pet[];
  orders: Order[];
};

export default function UserDetailsPage() {
  const params = useParams<{ userId: string }>();
  const router = useRouter();
  const [data, setData] = useState<UserDetailsResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const token = getAdminToken();
        const response = await api.get(`/admin/users/${params.userId}/details`, {
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
        setError(axiosError.response?.data?.message || "Failed to load user details");
      }
    };

    if (params.userId) {
      load();
    }
  }, [params.userId, router]);

  const orderMap = useMemo(() => {
    const map = new Map<string, Order[]>();

    (data?.orders || []).forEach((order) => {
      const key = String(order.petId);
      const existing = map.get(key) || [];
      existing.push(order);
      map.set(key, existing);
    });

    return map;
  }, [data]);

  if (!data && !error) {
    return <p>Loading user details...</p>;
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">User pets list</h1>

      {error ? <p className="rounded-md bg-rose-50 p-3 text-rose-700">{error}</p> : null}

      {data ? (
        <>
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold">{data.user.username}</h2>
            <p className="text-sm text-slate-600">{data.user.email}</p>
            <p className="text-sm text-slate-600">Mobile: {data.user.mobile}</p>
            <p className="text-sm text-slate-600">WhatsApp: {data.user.whatsapp}</p>
          </section>

          <section className="space-y-4">
            {data.pets.length === 0 ? (
              <p className="rounded-md border border-slate-200 bg-white p-4">No pets found for this user.</p>
            ) : (
              data.pets.map((pet) => (
                <article key={pet._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">{pet.name}</h3>
                      <p className="text-sm text-slate-600">Pet ID: {pet._id}</p>
                      <p className="text-sm text-slate-600">Age: {pet.age ?? "N/A"}</p>
                    </div>
                    {pet.photo ? (
                      <Image
                        src={pet.photo}
                        alt={pet.name}
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-md object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="mt-4">
                    <h4 className="font-semibold">Payment details</h4>
                    <div className="mt-2 space-y-2">
                      {(orderMap.get(pet._id) || []).length === 0 ? (
                        <p className="text-sm text-slate-500">No orders yet for this pet.</p>
                      ) : (
                        (orderMap.get(pet._id) || []).map((order) => (
                          <div key={order._id} className="rounded-md border border-slate-200 p-3 text-sm">
                            <p>Type: {order.type}</p>
                            <p>Status: {order.status}</p>
                            <p>Amount: ₹{order.amount}</p>
                            <p>Razorpay Order ID: {order.razorpayOrderId || "-"}</p>
                            <p>Razorpay Payment ID: {order.razorpayPaymentId || "-"}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
