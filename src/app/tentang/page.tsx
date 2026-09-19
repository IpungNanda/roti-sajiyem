"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import {
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiDollarSign,
  FiMessageCircle,
  FiShoppingBag,
} from "react-icons/fi";

// ==========================================
// VARIANTS ANIMASI
// ==========================================
const heroTextContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const heroTextItem = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const heroImageVariants = {
  hidden: { opacity: 0, scale: 0.9, x: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut" as const,
      delay: 0.2,
    },
  },
};

const yearBadgeVariants = {
  hidden: { opacity: 0, rotate: -10, scale: 0.8 },
  visible: {
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      delay: 0.6,
      ease: "easeOut" as const,
    },
  },
};

const sectionHeaderVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const timelineVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.15, ease: "easeOut" as const },
  },
};

const timelineIconVariants = {
  hidden: { opacity: 0, scale: 0.5, rotate: -20 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.5,
      delay: 0.4,
      type: "spring" as const,
      stiffness: 200,
    },
  },
};

const cardsContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const ctaVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const ctaIconVariants = {
  hidden: { opacity: 0, scale: 0.6, rotate: -15 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.5,
      delay: 0.3,
      type: "spring" as const,
      stiffness: 200,
    },
  },
};

export default function TentangPage() {
  return (
    <main className="min-h-screen bg-[#f7fbea]">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-green-100 bg-white">
        {/* Background Decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-yellow-100/60 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-green-100/70 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 lg:grid-cols-2 lg:py-20">
          {/* TEXT */}
          <motion.div
            variants={heroTextContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.span
              variants={heroTextItem}
              className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700"
            >
              <FiCheckCircle className="h-4 w-4" />
              Roti Sajiyem
            </motion.span>

            <motion.h1
              variants={heroTextItem}
              className="mt-5 text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl"
            >
              Rasa yang Telah Hadir
              <span className="mt-1 block text-green-700">
                Sejak Tahun 2000
              </span>
            </motion.h1>

            <motion.p
              variants={heroTextItem}
              className="mt-6 max-w-xl text-base leading-7 text-gray-600 sm:text-lg"
            >
              Roti Sajiyem merupakan usaha yang telah hadir sejak tahun
              2000 dan menyediakan berbagai pilihan produk roti dan bolu
              untuk berbagai kebutuhan pelanggan.
            </motion.p>

            <motion.div
              variants={heroTextItem}
              className="mt-8 flex flex-wrap gap-3"
            >
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  href="/produk"
                  className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800"
                >
                  <FiShoppingBag className="h-4 w-4" />
                  Lihat Produk
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

              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  href="/rekomendasi"
                  className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-white px-5 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-50"
                >
                  <FiMessageCircle className="h-4 w-4" />
                  Cari Rekomendasi
                </Link>
              </motion.div>
            </motion.div>

            {/* Tahun Berdiri */}
            <motion.div
              variants={yearBadgeVariants}
              className="mt-10 flex items-center gap-4"
            >
              <motion.div
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-yellow-700"
              >
                <FiCalendar className="h-5 w-5" />
              </motion.div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Berdiri sejak
                </p>

                <p className="text-lg font-bold text-green-800">
                  Tahun 2000
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* IMAGE */}
          <motion.div
            variants={heroImageVariants}
            initial="hidden"
            animate="visible"
            className="relative mx-auto w-full max-w-lg lg:max-w-xl"
          >
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-green-100 via-yellow-50 to-green-50 blur-2xl" />

            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="relative overflow-hidden rounded-[2rem] border border-green-100 bg-white p-3 shadow-xl"
            >
              <div className="relative aspect-[4/3] max-h-[420px] overflow-hidden rounded-[1.5rem] sm:max-h-[480px] lg:max-h-[520px]">
                <Image
                  src="/roti-sajiyem-sample.jpg"
                  alt="Produk Bolu Gulung Roti Sajiyem"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                  priority
                />
              </div>

              <div className="flex items-center justify-between gap-4 px-3 pb-2 pt-4">
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    Bolu Gulung
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Salah satu pilihan produk Roti Sajiyem
                  </p>
                </div>

                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-yellow-100 text-yellow-700"
                >
                  <FiCheckCircle className="h-4 w-4" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SEJARAH */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
        <motion.div
          variants={sectionHeaderVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-green-700">
            Perjalanan Kami
          </span>

          <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
            Roti Sajiyem Sejak 2000
          </h2>

          <p className="mt-5 text-base leading-7 text-gray-600">
            Sejak berdiri pada tahun 2000, Roti Sajiyem terus menyediakan
            berbagai pilihan roti dan bolu yang dapat disesuaikan dengan
            kebutuhan pelanggan. Produk seperti Bolu Gulung dan Mandarin
            menjadi bagian dari pilihan yang tersedia bagi pelanggan.
          </p>
        </motion.div>

        {/* TIMELINE */}
        <motion.div
          variants={timelineVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mx-auto mt-12 max-w-3xl"
        >
          <div className="relative rounded-3xl border border-green-100 bg-white p-7 shadow-sm sm:p-9">
            {/* Garis */}
            <div className="absolute bottom-8 left-[2.05rem] top-8 w-px bg-green-100 sm:left-[2.55rem]" />

            {/* Icon */}
            <div className="relative flex items-start gap-5">
              <motion.div
                variants={timelineIconVariants}
                className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-4 border-white bg-green-700 text-white shadow-sm"
              >
                <FiCalendar className="h-5 w-5" />
              </motion.div>

              <div className="pt-1">
                <p className="text-sm font-bold text-yellow-600">
                  2000
                </p>

                <h3 className="mt-1 text-xl font-bold text-gray-900">
                  Awal Perjalanan Roti Sajiyem
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Roti Sajiyem mulai hadir dan menjalankan usahanya sejak
                  tahun 2000. Hingga saat ini, berbagai pilihan produk
                  tetap tersedia untuk memenuhi kebutuhan pelanggan.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* NILAI / KEUNGGULAN */}
      <section className="border-y border-green-100 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
          <motion.div
            variants={sectionHeaderVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center"
          >
            <span className="text-sm font-bold uppercase tracking-[0.18em] text-green-700">
              Roti Sajiyem
            </span>

            <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
              Pilihan untuk Berbagai Kebutuhan
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-gray-500">
              Temukan produk yang sesuai dengan kebutuhan, selera, ukuran,
              dan anggaran Anda melalui katalog dan sistem rekomendasi.
            </p>
          </motion.div>

          <motion.div
            variants={cardsContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-10 grid gap-5 md:grid-cols-3"
          >
            {/* CARD 1 */}
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="group rounded-2xl border border-green-100 bg-[#f7fbea] p-6 shadow-sm"
            >
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-700 text-white shadow-sm"
              >
                <FiShoppingBag className="h-5 w-5" />
              </motion.div>

              <h3 className="mt-5 text-lg font-bold text-gray-900">
                Beragam Produk
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Tersedia berbagai pilihan roti dan bolu dengan variasi
                produk yang dapat dipilih sesuai kebutuhan.
              </p>
            </motion.div>

            {/* CARD 2 */}
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="group rounded-2xl border border-yellow-100 bg-[#fffdf2] p-6 shadow-sm"
            >
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-400 text-yellow-950 shadow-sm"
              >
                <FiDollarSign className="h-5 w-5" />
              </motion.div>

              <h3 className="mt-5 text-lg font-bold text-gray-900">
                Pilihan Sesuai Anggaran
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Informasi harga ditampilkan secara jelas sehingga pelanggan
                dapat memilih produk sesuai dengan anggaran.
              </p>
            </motion.div>

            {/* CARD 3 */}
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="group rounded-2xl border border-green-100 bg-[#f7fbea] p-6 shadow-sm"
            >
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-700 text-white shadow-sm"
              >
                <FiMessageCircle className="h-5 w-5" />
              </motion.div>

              <h3 className="mt-5 text-lg font-bold text-gray-900">
                Rekomendasi Produk
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Sistem rekomendasi membantu pelanggan menemukan pilihan
                produk yang lebih sesuai dengan kebutuhannya.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
        <motion.div
          variants={ctaVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="relative overflow-hidden rounded-3xl bg-green-800 px-6 py-12 text-center shadow-lg sm:px-10"
        >
          {/* Decoration */}
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-yellow-400/20 blur-2xl" />
          <div className="absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-green-500/20 blur-2xl" />

          <div className="relative">
            <motion.div
              variants={ctaIconVariants}
              animate={{
                y: [0, -6, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400 text-yellow-950"
            >
              <FiMessageCircle className="h-6 w-6" />
            </motion.div>

            <h2 className="mt-5 text-2xl font-bold text-white sm:text-3xl">
              Bingung Memilih Produk?
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-green-50 sm:text-base">
              Gunakan sistem rekomendasi Roti Sajiyem untuk menemukan
              produk yang sesuai dengan kebutuhan dan anggaran Anda.
            </p>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="mt-7 inline-block"
            >
              <Link
                href="/rekomendasi"
                className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-6 py-3 text-sm font-bold text-green-950 shadow-sm transition hover:bg-yellow-300"
              >
                Coba Rekomendasi
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
          </div>
        </motion.div>
      </section>
    </main>
  );
}