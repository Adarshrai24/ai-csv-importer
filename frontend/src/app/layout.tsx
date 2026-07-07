import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CSV Importer — GrowEasy CRM",
  description:
    "AI-powered CSV importer that intelligently extracts CRM lead information from any CSV format using Google Gemini.",
  keywords: ["CSV", "CRM", "AI", "import", "leads", "GrowEasy"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
