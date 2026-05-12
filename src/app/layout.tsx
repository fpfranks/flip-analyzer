import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "FlipIQ — Electronics Flipping Analyzer",
  description: "Find, analyze, and track electronics flips for maximum profit",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-6 overflow-auto min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
