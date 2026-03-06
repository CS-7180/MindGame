import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MindGame — Pre-Game Mental Routine Builder",
  description:
    "Build personalized pre-game mental routines using visualization, breathing, and affirmations. Track your routine adherence and performance over time.",
};

import { Toaster as SonnerToaster } from "sonner";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <SonnerToaster theme="dark" position="top-center" richColors />
        <ShadcnToaster />
      </body>
    </html>
  );
}
