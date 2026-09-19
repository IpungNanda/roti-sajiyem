"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type UserLayoutProps = {
  children: ReactNode;
};

export default function UserLayout({
  children,
}: UserLayoutProps) {
  const pathname = usePathname();

  // ==========================================
  // Halaman admin tidak menggunakan
  // Navbar dan Footer user
  // ==========================================
  const isAdminPage = pathname.startsWith("/admin");

  if (isAdminPage) {
    return <>{children}</>;
  }

  // ==========================================
  // Layout untuk halaman user
  // ==========================================
  return (
    <div className="flex min-h-screen flex-col bg-[#f7fbea]">
      {/* NAVBAR */}
      <Navbar />

      {/* CONTENT */}
      <main className="min-w-0 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}