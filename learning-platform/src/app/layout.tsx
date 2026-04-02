import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], weight: ["300","400","500","600","700","800"] });

export const metadata: Metadata = {
  title: "Barashada Tooska ah — THEQNEW Learning",
  description: "Ku baro xirfadaha mustaqbalka — Free AI & Tech courses in Somali & English",
  manifest: "/manifest.json",
  themeColor: "#070b14",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="so" className={inter.className}>
      <body className="min-h-screen">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
