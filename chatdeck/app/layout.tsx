import { Footer } from "@/components/Blocks/Footer";
import { Navbar } from "@/components/navbar";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TripPlanner - Simple AI Trip & Weekend Planner",
  description: "Plan weekend trips and getaways in seconds. Day-by-day itineraries, live weather, packing lists, and budget estimates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-black min-h-screen flex flex-col justify-between`}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
