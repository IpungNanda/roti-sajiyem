"use client";

import { ReactNode, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";

import {
  FiCheckCircle,
  FiShield,
} from "react-icons/fi";

import { auth } from "@/lib/firebase";

type AdminGuardProps = {
  children: ReactNode;
};

// ==========================================
// VARIANTS ANIMASI
// ==========================================
const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

const iconVariants = {
  hidden: { opacity: 0, scale: 0.7 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const contentVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export default function AdminGuard({
  children,
}: AdminGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          // User sudah login
          setIsAuthenticated(true);
          setIsChecking(false);
        } else {
          // User belum login
          setIsAuthenticated(false);
          setIsChecking(false);

          const loginUrl =
            `/admin/login?redirect=${encodeURIComponent(
              pathname
            )}`;

          router.replace(loginUrl);
        }
      }
    );

    return () => unsubscribe();
  }, [router, pathname]);

  // ==========================================
  // Loading saat Firebase mengecek status login
  // ==========================================
  if (isChecking) {
    return (
      <motion.main
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="flex min-h-screen items-center justify-center bg-[#f7fbea] px-5"
      >
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-sm rounded-3xl border border-green-100 bg-white p-8 text-center shadow-sm"
        >
          {/* Icon */}
          <motion.div
            variants={iconVariants}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-700"
          >
            <motion.span
              animate={{
                scale: [1, 1.15, 1],
                opacity: [1, 0.8, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <FiShield className="h-7 w-7" />
            </motion.span>
          </motion.div>

          {/* Loading */}
          <motion.div
            variants={itemVariants}
            className="mx-auto mt-6 h-9 w-9 animate-spin rounded-full border-4 border-green-100 border-t-green-700"
          />

          {/* Text */}
          <motion.h2
            variants={itemVariants}
            className="mt-5 text-base font-bold text-gray-900"
          >
            Memeriksa Akses
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="mt-2 text-sm leading-6 text-gray-500"
          >
            Sistem sedang memeriksa status autentikasi Anda.
          </motion.p>

          {/* Status */}
          <motion.div
            variants={itemVariants}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-yellow-50 px-4 py-2 text-xs font-semibold text-yellow-700"
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <FiCheckCircle className="h-4 w-4" />
            </motion.span>
            Mohon tunggu sebentar
          </motion.div>
        </motion.div>
      </motion.main>
    );
  }

  // ==========================================
  // Jangan tampilkan halaman admin
  // sebelum user terautentikasi
  // ==========================================
  if (!isAuthenticated) {
    return null;
  }

  // ==========================================
  // User sudah login
  // ==========================================
  return (
    <motion.div
      variants={contentVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}