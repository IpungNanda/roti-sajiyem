"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import {
  FiArrowRight,
  FiBarChart2,
  FiCheckCircle,
  FiGlobe,
  FiGrid,
  FiInfo,
  FiLogOut,
  FiMessageCircle,
  FiPackage,
  FiSearch,
  FiSettings,
  FiShoppingBag,
  FiStar,
} from "react-icons/fi";

import { auth, db } from "@/lib/firebase";

// ==========================================
// VARIANTS ANIMASI
// ==========================================
const sidebarVariants = {
  hidden: { x: -300, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
      staggerChildren: 0.05,
      delayChildren: 0.15,
    },
  },
};

const sidebarItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

const sidebarLogoVariants = {
  hidden: { opacity: 0, scale: 0.6, rotate: -15 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.5,
      type: "spring" as const,
      stiffness: 200,
    },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const headerItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const welcomeVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      delay: 0.4,
      ease: "easeOut" as const,
      staggerChildren: 0.1,
      delayChildren: 0.5,
    },
  },
};

const welcomeItemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const statsContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.5,
    },
  },
};

const statCardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const sectionHeaderVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const quickMenuContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const quickMenuCardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function AdminPage() {
  const router = useRouter();

  // ==========================================
  // STATISTIK PRODUK DARI FIRESTORE
  // ==========================================
  const [totalProducts, setTotalProducts] =
    useState(0);

  const [activeProducts, setActiveProducts] =
    useState(0);

  const [loadingStats, setLoadingStats] =
    useState(true);

  useEffect(() => {
    async function fetchProductStats() {
      try {
        setLoadingStats(true);

        const snapshot = await getDocs(
          collection(db, "products")
        );

        const products = snapshot.docs.map(
          (doc) => doc.data()
        );

        const activeCount = products.filter(
          (product) => product.isActive === true
        ).length;

        setTotalProducts(products.length);
        setActiveProducts(activeCount);
      } catch (error) {
        console.error(
          "Gagal mengambil statistik produk:",
          error
        );

        setTotalProducts(0);
        setActiveProducts(0);
      } finally {
        setLoadingStats(false);
      }
    }

    fetchProductStats();
  }, []);

  // ==========================================
  // Logout Admin
  // ==========================================
  const handleLogout = async () => {
    try {
      await signOut(auth);

      router.replace("/admin/login");
    } catch (error) {
      console.error("Logout gagal:", error);
      alert("Gagal keluar dari akun. Silakan coba lagi.");
    }
  };

  return (
    <main className="min-h-screen bg-[#f7fbea]">
      {/* ==========================================
          SIDEBAR
      ========================================== */}
      <motion.aside
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-green-100 bg-white lg:block"
      >
        {/* Logo */}
        <motion.div
          variants={sidebarItemVariants}
          className="flex h-20 items-center gap-3 border-b border-green-50 px-6"
        >
          <motion.div
            variants={sidebarLogoVariants}
            whileHover={{ scale: 1.05 }}
            className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-green-700 text-sm font-bold text-white shadow-sm"
          >
            RS

            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-yellow-400"
            />
          </motion.div>

          <div>
            <h1 className="text-base font-bold text-gray-900">
              Roti Sajiyem
            </h1>

            <p className="text-xs text-gray-500">
              Administrator
            </p>
          </div>
        </motion.div>

        {/* Navigation */}
        <nav className="px-4 py-6">
          <motion.p
            variants={sidebarItemVariants}
            className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400"
          >
            Menu Utama
          </motion.p>

          <div className="space-y-1">
            {/* Dashboard */}
            <motion.div
              variants={sidebarItemVariants}
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link
                href="/admin"
                className="flex items-center gap-3 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700"
              >
                <motion.span
                  animate={{ rotate: [0, 8, -8, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <FiGrid className="h-5 w-5" />
                </motion.span>
                Dashboard
              </Link>
            </motion.div>

            {/* Produk */}
            <motion.div
              variants={sidebarItemVariants}
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link
                href="/admin/produk"
                className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-green-50 hover:text-green-700"
              >
                <FiShoppingBag className="h-5 w-5 text-gray-400 transition group-hover:text-green-600" />
                Produk
              </Link>
            </motion.div>

            {/* Rekomendasi */}
            <motion.div
              variants={sidebarItemVariants}
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link
                href="/admin/rekomendasi"
                className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-green-50 hover:text-green-700"
              >
                <FiStar className="h-5 w-5 text-gray-400 transition group-hover:text-green-600" />
                Rekomendasi
              </Link>
            </motion.div>
          </div>

          <motion.p
            variants={sidebarItemVariants}
            className="mb-3 mt-8 px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400"
          >
            Sistem
          </motion.p>

          <div className="space-y-1">
            {/* Website */}
            <motion.div
              variants={sidebarItemVariants}
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link
                href="/"
                target="_blank"
                className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-green-50 hover:text-green-700"
              >
                <FiGlobe className="h-5 w-5 text-gray-400 transition group-hover:text-green-600" />
                Lihat Website
              </Link>
            </motion.div>

            {/* Logout */}
            <motion.button
              variants={sidebarItemVariants}
              type="button"
              onClick={handleLogout}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-500 transition hover:bg-red-50"
            >
              <motion.span
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FiLogOut className="h-5 w-5" />
              </motion.span>
              Keluar
            </motion.button>
          </div>
        </nav>

        {/* Sidebar Bottom */}
        <motion.div
          variants={sidebarItemVariants}
          className="absolute bottom-0 left-0 right-0 border-t border-green-50 p-4"
        >
          <div className="rounded-2xl bg-green-50 p-4">
            <div className="flex items-center gap-2">
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <FiCheckCircle className="h-4 w-4 text-green-700" />
              </motion.span>

              <span className="text-xs font-semibold text-green-800">
                Sistem Aktif
              </span>
            </div>

            <p className="mt-2 text-[11px] leading-5 text-green-700/70">
              Panel administrator Roti Sajiyem
            </p>
          </div>
        </motion.div>
      </motion.aside>

      {/* ==========================================
          MAIN CONTENT
      ========================================== */}
      <div className="lg:pl-64">
        {/* ==========================================
            HEADER
        ========================================== */}
        <motion.header
          variants={headerVariants}
          initial="hidden"
          animate="visible"
          className="sticky top-0 z-30 border-b border-green-100 bg-white/95 backdrop-blur"
        >
          <div className="flex h-20 items-center justify-between px-5 sm:px-8">
            <motion.div variants={headerItemVariants}>
              <div className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: [0, 8, -8, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <FiGrid className="h-5 w-5 text-green-700" />
                </motion.span>

                <h2 className="text-xl font-bold text-gray-900">
                  Dashboard
                </h2>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Selamat datang di panel admin Roti Sajiyem.
              </p>
            </motion.div>

            {/* Admin Profile */}
            <motion.div
              variants={headerItemVariants}
              className="flex items-center gap-3"
            >
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-gray-700">
                  Administrator
                </p>

                <p className="text-xs text-gray-400">
                  Roti Sajiyem
                </p>
              </div>

              <motion.div
                whileHover={{ scale: 1.08 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-green-100 font-bold text-green-700"
              >
                A

                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-yellow-400"
                />
              </motion.div>
            </motion.div>
          </div>
        </motion.header>

        {/* ==========================================
            CONTENT
        ========================================== */}
        <div className="p-5 sm:p-8">
          {/* ==========================================
              WELCOME
          ========================================== */}
          <motion.section
            variants={welcomeVariants}
            initial="hidden"
            animate="visible"
            className="relative mb-8 overflow-hidden rounded-3xl bg-green-800 p-6 text-white shadow-sm sm:p-8"
          >
            {/* Decorative */}
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-yellow-400/15 blur-2xl"
            />

            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="absolute -bottom-24 -left-16 h-52 w-52 rounded-full bg-green-500/20 blur-2xl"
            />

            <div className="relative max-w-2xl">
              <motion.div
                variants={welcomeItemVariants}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-green-50"
              >
                <motion.span
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <FiSettings className="h-4 w-4" />
                </motion.span>
                Panel Administrator
              </motion.div>

              <motion.h1
                variants={welcomeItemVariants}
                className="mt-5 text-2xl font-bold leading-tight sm:text-3xl"
              >
                Kelola Roti Sajiyem
                <span className="block text-yellow-300">
                  dengan Mudah
                </span>
              </motion.h1>

              <motion.p
                variants={welcomeItemVariants}
                className="mt-3 max-w-xl text-sm leading-6 text-green-50 sm:text-base"
              >
                Kelola informasi produk, harga, rasa, ukuran,
                dan informasi lainnya melalui halaman
                administrator.
              </motion.p>

              <motion.div
                variants={welcomeItemVariants}
                className="mt-6"
              >
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-block"
                >
                  <Link
                    href="/admin/produk"
                    className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 text-sm font-bold text-green-950 transition hover:bg-yellow-300"
                  >
                    <motion.span
                      whileHover={{ rotate: 10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <FiShoppingBag className="h-4 w-4" />
                    </motion.span>

                    Kelola Produk

                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <FiArrowRight className="h-4 w-4" />
                    </motion.span>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </motion.section>

          {/* ==========================================
              STATISTICS
          ========================================== */}
          <motion.section
            variants={statsContainerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
          >
            {/* Total Produk */}
            <motion.div
              variants={statCardVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Total Produk
                  </p>

                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {loadingStats ? "..." : totalProducts}
                  </p>

                  <p className="mt-2 text-xs text-gray-400">
                    Seluruh produk dalam database
                  </p>
                </div>

                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-700"
                >
                  <FiPackage className="h-6 w-6" />
                </motion.div>
              </div>
            </motion.div>

            {/* Produk Aktif */}
            <motion.div
              variants={statCardVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Produk Aktif
                  </p>

                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {loadingStats ? "..." : activeProducts}
                  </p>

                  <p className="mt-2 text-xs text-gray-400">
                    Produk dengan status aktif
                  </p>
                </div>

                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50 text-yellow-700"
                >
                  <FiCheckCircle className="h-6 w-6" />
                </motion.div>
              </div>
            </motion.div>

            {/* Rekomendasi */}
            <motion.div
              variants={statCardVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Sistem Rekomendasi
                  </p>

                  <p className="mt-2 text-lg font-bold text-gray-900">
                    Content-Based
                  </p>

                  <p className="mt-2 text-xs text-gray-400">
                    TF-IDF & Cosine Similarity
                  </p>
                </div>

                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-700"
                >
                  <FiStar className="h-6 w-6" />
                </motion.div>
              </div>
            </motion.div>

            {/* Pemesanan */}
            <motion.div
              variants={statCardVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Pemesanan
                  </p>

                  <p className="mt-2 text-lg font-bold text-gray-900">
                    WhatsApp
                  </p>

                  <p className="mt-2 text-xs text-gray-400">
                    Terhubung langsung ke pelanggan
                  </p>
                </div>

                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50 text-yellow-700"
                >
                  <FiMessageCircle className="h-6 w-6" />
                </motion.div>
              </div>
            </motion.div>
          </motion.section>

          {/* ==========================================
              MENU CEPAT
          ========================================== */}
          <section className="mt-10">
            <motion.div
              variants={sectionHeaderVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="mb-5"
            >
              <div className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: [0, 8, -8, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <FiBarChart2 className="h-5 w-5 text-green-700" />
                </motion.span>

                <h2 className="text-lg font-bold text-gray-900">
                  Menu Cepat
                </h2>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Akses fitur administrator dengan cepat.
              </p>
            </motion.div>

            <motion.div
              variants={quickMenuContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
            >
              {/* Kelola Produk */}
              <motion.div
                variants={quickMenuCardVariants}
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <Link
                  href="/admin/produk"
                  className="group block rounded-2xl border border-green-100 bg-white p-6 shadow-sm transition hover:border-green-200 hover:shadow-md"
                >
                  <motion.div
                    whileHover={{
                      backgroundColor: "#15803d",
                      color: "#ffffff",
                    }}
                    transition={{ duration: 0.3 }}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-700"
                  >
                    <FiShoppingBag className="h-6 w-6" />
                  </motion.div>

                  <h3 className="mt-5 font-bold text-gray-900">
                    Kelola Produk
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Tambahkan, ubah, atau hapus informasi produk
                    Roti Sajiyem.
                  </p>

                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-green-700">
                    Buka menu

                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <FiArrowRight className="h-4 w-4" />
                    </motion.span>
                  </span>
                </Link>
              </motion.div>

              {/* Rekomendasi */}
              <motion.div
                variants={quickMenuCardVariants}
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <Link
                  href="/admin/rekomendasi"
                  className="group block rounded-2xl border border-yellow-100 bg-white p-6 shadow-sm transition hover:border-yellow-200 hover:shadow-md"
                >
                  <motion.div
                    whileHover={{
                      backgroundColor: "#facc15",
                      color: "#422006",
                    }}
                    transition={{ duration: 0.3 }}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50 text-yellow-700"
                  >
                    <FiStar className="h-6 w-6" />
                  </motion.div>

                  <h3 className="mt-5 font-bold text-gray-900">
                    Sistem Rekomendasi
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Melihat dan menguji hasil rekomendasi
                    produk berdasarkan karakteristik produk.
                  </p>

                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-green-700">
                    Lihat rekomendasi

                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <FiArrowRight className="h-4 w-4" />
                    </motion.span>
                  </span>
                </Link>
              </motion.div>

              {/* Website */}
              <motion.div
                variants={quickMenuCardVariants}
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <Link
                  href="/"
                  target="_blank"
                  className="group block rounded-2xl border border-green-100 bg-white p-6 shadow-sm transition hover:border-green-200 hover:shadow-md"
                >
                  <motion.div
                    whileHover={{
                      backgroundColor: "#15803d",
                      color: "#ffffff",
                    }}
                    transition={{ duration: 0.3 }}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-700"
                  >
                    <FiGlobe className="h-6 w-6" />
                  </motion.div>

                  <h3 className="mt-5 font-bold text-gray-900">
                    Lihat Website
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Membuka tampilan website yang akan dilihat
                    oleh pelanggan.
                  </p>

                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-green-700">
                    Buka website

                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <FiArrowRight className="h-4 w-4" />
                    </motion.span>
                  </span>
                </Link>
              </motion.div>
            </motion.div>
          </section>

          {/* ==========================================
              INFORMATION
          ========================================== */}
          <motion.section
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="mt-10 rounded-2xl border border-yellow-100 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-50 text-yellow-700"
              >
                <FiInfo className="h-6 w-6" />
              </motion.div>

              <div>
                <h3 className="font-bold text-gray-900">
                  Informasi Sistem
                </h3>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
                  Dashboard ini digunakan untuk mengelola
                  informasi produk Roti Sajiyem. Data produk
                  nantinya akan terhubung dengan Firebase
                  Firestore dan gambar produk akan dikelola
                  menggunakan Cloudinary.
                </p>
              </div>
            </div>
          </motion.section>

          {/* ==========================================
              FOOTER
          ========================================== */}
          <motion.footer
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-10 border-t border-green-100 py-6"
          >
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              <div className="flex items-center gap-2 text-xs font-medium text-green-700">
                <motion.span
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <FiCheckCircle className="h-3.5 w-3.5" />
                </motion.span>
                Roti Sajiyem
              </div>

              <p className="text-xs text-gray-400">
                © {new Date().getFullYear()} Roti Sajiyem.
                Sistem Informasi dan Rekomendasi Produk.
              </p>
            </div>
          </motion.footer>
        </div>
      </div>
    </main>
  );
}