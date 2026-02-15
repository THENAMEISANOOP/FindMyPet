"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, MapPin, Loader2 } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import CustomAlert from "@/app/components/CustomAlert";

export default function AddressPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const petId = searchParams.get("petId");
  const type = searchParams.get("type");
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ message: string | null; type: "success" | "error" | "info" }>({ message: null, type: "info" });

  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: ""
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/auth");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Store address in session storage to pass to next step
    sessionStorage.setItem("purchase_address", JSON.stringify(address));

    if (type === "QR_BELT") {
      router.push(`/purchase/customization?petId=${petId}&type=${type}`);
    } else {
      router.push(`/purchase/payment?petId=${petId}&type=${type}`);
    }
  };

  if (!petId || !type) return <div>Invalid request</div>;

  return (
    <div className="min-h-screen bg-brand-beige text-brand-charcoal font-sans">
      <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert({ ...alert, message: null })} />
      <Navbar userName={user?.username} />

      <main className="max-w-2xl mx-auto p-6 py-12">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-brand-charcoal/50 hover:text-brand-teal transition-colors mb-8 font-bold text-sm uppercase tracking-wider group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
        </button>

        <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-brand-sand/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-teal/5 rounded-bl-[3rem]"></div>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-brand-teal/10 p-3 rounded-2xl text-brand-teal">
              <MapPin size={24} />
            </div>
            <h1 className="text-3xl font-black tracking-tight">Delivery Address</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/40 ml-2">Street Address</label>
              <input 
                required 
                className="w-full p-5 bg-brand-beige border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-teal text-brand-charcoal font-bold placeholder:text-brand-charcoal/30" 
                placeholder="Shop No, Building, Street" 
                value={address.street}
                onChange={(e) => setAddress({...address, street: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/40 ml-2">City</label>
                <input 
                  required 
                  className="w-full p-5 bg-brand-beige border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-teal text-brand-charcoal font-bold placeholder:text-brand-charcoal/30" 
                  placeholder="City" 
                  value={address.city}
                  onChange={(e) => setAddress({...address, city: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/40 ml-2">State</label>
                <input 
                  required 
                  className="w-full p-5 bg-brand-beige border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-teal text-brand-charcoal font-bold placeholder:text-brand-charcoal/30" 
                  placeholder="State" 
                  value={address.state}
                  onChange={(e) => setAddress({...address, state: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/40 ml-2">Pincode</label>
              <input 
                required 
                className="w-full p-5 bg-brand-beige border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand-teal text-brand-charcoal font-bold placeholder:text-brand-charcoal/30" 
                placeholder="6 digits" 
                value={address.zip}
                maxLength={6}
                onChange={(e) => setAddress({...address, zip: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-5 bg-brand-teal text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-teal-dark transition-all shadow-lg shadow-brand-teal/20 active:scale-95"
            >
              {type === "QR_BELT" ? "Next: Customization" : "Proceed to Payment"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
