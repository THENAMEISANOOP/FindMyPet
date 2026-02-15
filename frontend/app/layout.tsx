import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Footer from "./components/Footer";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pet Finder",
  description: "Protect your furry friends with QR technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.className} antialiased bg-brand-beige text-brand-charcoal`}
      >
        {children}
        <Footer />
        
        {/* Razorpay SDK loaded via Next.js Script optimization */}
        <Script 
          src="https://checkout.razorpay.com/v1/checkout.js" 
          strategy="beforeInteractive" 
        />
      </body>
    </html>
  );
}