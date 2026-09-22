import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "FixLens — AI-Generated Visual Repair Videos for iQOO Users",
  description:
    "Capture or upload a photo of a damaged object. FixLens AI identifies the object, verifies DIY safety, and generates a personalized 15-second visual repair video in English and Tamil.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-slate-50 text-slate-900 antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
