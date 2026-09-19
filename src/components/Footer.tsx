"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import {
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiMessageCircle,
  FiShoppingBag,
} from "react-icons/fi";

// ==========================================
// VARIANTS ANIMASI
// ==========================================
const footerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const columnVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const linkContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const linkItemVariants = {
  hidden: { opacity: 0, x: -15 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

const infoItemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const ctaVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const bottomVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: 0.2, ease: "easeOut" as const },
  },
};

export default function Footer() {
  return (
    <motion.footer
      variants={footerContainerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      className="border-t border-green-100 bg-white"
    >
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-14">
        <div className="grid gap-10 md:grid-cols-3">
          {/* ==========================================
              IDENTITAS
          ========================================== */}
          <motion.div variants={columnVariants}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link
                href="/tentang"
                className="inline-flex items-center gap-3"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-700 text-sm font-bold text-white shadow-sm">
                  RS
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Roti Sajiyem
                  </h2>

                  <p className="text-xs text-gray-500">
                    Roti Pilihan Keluarga
                  </p>
                </div>
              </Link>
            </motion.div>

            <p className="mt-5 max-w-sm text-sm leading-6 text-gray-600">
              Roti Sajiyem merupakan usaha yang telah hadir sejak tahun
              2000 dengan berbagai pilihan roti dan bolu untuk memenuhi
              kebutuhan pelanggan.
            </p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-2 text-xs font-semibold text-yellow-700"
            >
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <FiCheckCircle className="h-4 w-4" />
              </motion.span>
              Melayani sejak tahun 2000
            </motion.div>
          </motion.div>

          {/* ==========================================
              NAVIGASI
          ========================================== */}
          <motion.div variants={columnVariants}>
            <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-gray-900">
              Navigasi
            </h3>

            <motion.div
              variants={linkContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="mt-5 flex flex-col gap-3"
            >
              <motion.div variants={linkItemVariants}>
                <Link
                  href="/tentang"
                  className="group flex w-fit items-center gap-2 text-sm text-gray-600 transition hover:text-green-700"
                >
                  <FiArrowRight className="h-4 w-4 text-green-600 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
                  <span>Beranda</span>
                </Link>
              </motion.div>

              <motion.div variants={linkItemVariants}>
                <Link
                  href="/produk"
                  className="group flex w-fit items-center gap-2 text-sm text-gray-600 transition hover:text-green-700"
                >
                  <FiArrowRight className="h-4 w-4 text-green-600 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
                  <span>Produk</span>
                </Link>
              </motion.div>

              <motion.div variants={linkItemVariants}>
                <Link
                  href="/rekomendasi"
                  className="group flex w-fit items-center gap-2 text-sm text-gray-600 transition hover:text-green-700"
                >
                  <FiArrowRight className="h-4 w-4 text-green-600 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
                  <span>Rekomendasi</span>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* ==========================================
              INFORMASI
          ========================================== */}
          <motion.div variants={columnVariants}>
            <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-gray-900">
              Roti Sajiyem
            </h3>

            <motion.div
              variants={linkContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="mt-5 space-y-4"
            >
              {/* Produk */}
              <motion.div
                variants={infoItemVariants}
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex items-start gap-3"
              >
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700"
                >
                  <FiShoppingBag className="h-4 w-4" />
                </motion.div>

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Beragam Produk
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Berbagai pilihan roti dan bolu untuk kebutuhan
                    pelanggan.
                  </p>
                </div>
              </motion.div>

              {/* Tahun */}
              <motion.div
                variants={infoItemVariants}
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex items-start gap-3"
              >
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yellow-50 text-yellow-700"
                >
                  <FiCalendar className="h-4 w-4" />
                </motion.div>

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Sejak Tahun 2000
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Hadir dan melayani pelanggan sejak tahun 2000.
                  </p>
                </div>
              </motion.div>

              {/* WhatsApp */}
              <motion.div
                variants={infoItemVariants}
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex items-start gap-3"
              >
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700"
                >
                  <FiMessageCircle className="h-4 w-4" />
                </motion.div>

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Pemesanan WhatsApp
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Pemesanan dapat dilakukan melalui WhatsApp.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* ==========================================
            CTA
        ========================================== */}
        <motion.div
          variants={ctaVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-12 overflow-hidden rounded-2xl bg-green-800 px-5 py-6 sm:px-7"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-white">
                Bingung memilih produk?
              </p>

              <p className="mt-1 text-xs leading-5 text-green-100">
                Gunakan sistem rekomendasi untuk menemukan produk yang
                sesuai dengan kebutuhan Anda.
              </p>
            </div>

            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="w-fit shrink-0"
            >
              <Link
                href="/rekomendasi"
                className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2.5 text-xs font-bold text-green-950 transition hover:bg-yellow-300"
              >
                Cari Rekomendasi
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
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* ==========================================
            BOTTOM
        ========================================== */}
        <motion.div
          variants={bottomVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-8 flex flex-col gap-3 border-t border-green-100 pt-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left"
        >
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Roti Sajiyem. Semua hak
            dilindungi.
          </p>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-400 sm:justify-end">
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <FiCheckCircle className="h-3.5 w-3.5 text-green-600" />
            </motion.span>
            <span>Sistem Rekomendasi Produk UMKM</span>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}