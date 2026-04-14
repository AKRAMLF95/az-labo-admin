import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import LayoutShell from "./components/LayoutShell";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AZ Laboratoires — Panel Admin",
  description: "Panel d'administration AZ Laboratoires",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geist.variable} h-full`}>
      <body className="h-full bg-[#f5f7fb] text-[#111]">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
