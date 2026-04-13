import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AZ Laboratoires — Panel Admin",
  description: "Panel d'administration AZ Laboratoires",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${geist.variable} h-full`}>
      <body className="h-full bg-[#f5f7fb] text-[#111]">
        <div className="flex h-full">
          <Sidebar />
          <div className="flex-1 flex flex-col ml-60 min-h-screen">
            <Header />
            <main className="flex-1 overflow-auto p-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
