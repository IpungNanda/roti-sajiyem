import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import UserLayout from "@/components/UserLayout";
import WhatsAppButton from "@/components/WhatsAppButton";
import LocalBusinessSchema from "@/components/seo/LocalBusinessSchema";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Roti Sajiyem Bakery | Roti dan Bolu Sukoharjo",
    template: "%s | Roti Sajiyem Bakery",
  },
  description:
    "Roti Sajiyem Bakery menyediakan berbagai pilihan roti dan bolu di Blimbing, Gatak, Kabupaten Sukoharjo, Jawa Tengah.",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LocalBusinessSchema />

        <UserLayout>{children}</UserLayout>

        {/* Floating WhatsApp Button */}
        <WhatsAppButton />
      </body>
    </html>
  );
}