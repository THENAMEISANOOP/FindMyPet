"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to the login page
    router.replace("/login");
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold text-gray-700">Redirecting to Login...</h1>
    </div>
  );
}

