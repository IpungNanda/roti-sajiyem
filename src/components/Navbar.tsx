"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import {
  FiArrowRight,
  FiHome,
  FiSearch,
  FiShoppingBag,
  FiStar,
} from "react-icons/fi";

const menuItems = [
  {
    name: "Beranda",
    href: "/tentang",
    icon: FiHome,
  },
  {
    name: "Produk",
    href: "/produk",
    icon: FiShoppingBag,
  },
  {
    name: "Rekomendasi",
    href: "/rekomendasi",
    icon: FiStar,
  },
];

// ==========================================
// VARIANTS ANIMASI
// ==========================================
const headerVariants = {
  hidden: { y: -80, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const logoVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const navContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const navItemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

const ctaVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, delay: 0.3, ease: "easeOut" as const },
  },
};

const mobileMenuVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

export default function Navbar() {
  const pathname = usePathname();

  return (
    <motion.header
      variants={headerVariants}
      initial="hidden"
      animate="visible"
      className="sticky top-0 z-50 border-b border-green-100 bg-white/95 shadow-sm backdrop-blur"
    >
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
        {/* ==========================================
            LOGO
        ========================================== */}
        <motion.div variants={logoVariants}>
          <Link
            href="/tentang"
            className="group flex items-center gap-3"
          >
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-green-700 text-sm font-bold text-white shadow-sm transition group-hover:bg-green-800">
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
            </div>

            <div>
              <h1 className="text-base font-bold tracking-tight text-gray-900 sm:text-lg">
                Roti Sajiyem
              </h1>

              <p className="hidden text-xs text-gray-500 sm:block">
                Roti Pilihan Keluarga
              </p>
            </div>
          </Link>
        </motion.div>

        {/* ==========================================
            MENU DESKTOP
        ========================================== */}
        <motion.nav
          variants={navContainerVariants}
          initial="hidden"
          animate="visible"
          className="hidden items-center gap-1 md:flex"
        >
          {menuItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              item.href === "/tentang"
                ? pathname === "/tentang"
                : pathname.startsWith(item.href);

            return (
              <motion.div
                key={item.href}
                variants={navItemVariants}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="relative"
              >
                {/* Active indicator dengan layout animation */}
                {isActive && (
                  <motion.span
                    layoutId="navbar-active-desktop"
                    className="absolute inset-0 rounded-xl bg-green-50"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}

                <Link
                  href={item.href}
                  className={`group relative inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "text-green-700"
                      : "text-gray-600 hover:text-green-700"
                  }`}
                >
                  <motion.span
                    whileHover={{ rotate: 12, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon
                      className={`h-4 w-4 transition ${
                        isActive
                          ? "text-green-700"
                          : "text-gray-400 group-hover:text-green-600"
                      }`}
                    />
                  </motion.span>

                  {item.name}
                </Link>
              </motion.div>
            );
          })}
        </motion.nav>

        {/* ==========================================
            TOMBOL REKOMENDASI DESKTOP
        ========================================== */}
        <motion.div
          variants={ctaVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Link
              href="/rekomendasi"
              className="hidden items-center gap-2 rounded-xl bg-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 sm:inline-flex"
            >
              <FiSearch className="h-4 w-4" />

              Cari Rekomendasi

              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <FiArrowRight className="h-4 w-4" />
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>

        {/* ==========================================
            TOMBOL MOBILE
        ========================================== */}
        <div className="flex items-center gap-2 md:hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/rekomendasi"
              className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-green-800"
            >
              <FiSearch className="h-3.5 w-3.5" />

              <span className="hidden xs:inline">
                Rekomendasi
              </span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ==========================================
          MENU MOBILE
      ========================================== */}
      <div className="border-t border-green-50 bg-white md:hidden">
        <motion.nav
          variants={mobileMenuVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto flex max-w-7xl items-center justify-center gap-1 overflow-x-auto px-4 py-2"
        >
          {menuItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              item.href === "/tentang"
                ? pathname === "/tentang"
                : pathname.startsWith(item.href);

            return (
              <motion.div
                key={item.href}
                variants={navItemVariants}
                whileTap={{ scale: 0.95 }}
                className="relative shrink-0"
              >
                {/* Active indicator mobile */}
                {isActive && (
                  <motion.span
                    layoutId="navbar-active-mobile"
                    className="absolute inset-0 rounded-lg bg-green-50"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}

                <Link
                  href={item.href}
                  className={`relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition ${
                    isActive
                      ? "text-green-700"
                      : "text-gray-600 hover:text-green-700"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />

                  {item.name}
                </Link>
              </motion.div>
            );
          })}
        </motion.nav>
      </div>
    </motion.header>
  );
}