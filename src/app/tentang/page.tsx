
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiDollarSign,
  FiMessageCircle,
  FiShoppingBag,
} from "react-icons/fi";

const features = [
  {
    title: "Beragam Produk",
    description:
      "Tersedia berbagai pilihan roti dan bolu yang dapat dipilih sesuai kebutuhan.",
    icon: FiShoppingBag,
    theme: "green",
  },
  {
    title: "Pilihan Sesuai Anggaran",
    description:
      "Informasi harga ditampilkan dengan jelas agar pelanggan dapat menyesuaikan pilihan dengan anggaran.",
    icon: FiDollarSign,
    theme: "yellow",
  },
  {
    title: "Rekomendasi Produk",
    description:
      "Sistem rekomendasi membantu pelanggan menemukan produk berdasarkan kategori, rasa, ukuran, dan anggaran.",
    icon: FiMessageCircle,
    theme: "green",
  },
];

export default function TentangPage() {
  const reduceMotion = useReducedMotion();

  const reveal = {
    hidden: {
      opacity: 0,
      y: reduceMotion ? 0 : 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0 : 0.5,
      },
    },
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7fbea] text-gray-900">
      {/* HERO */}
      <section className="relative isolate overflow-hidden border-b border-green-100 bg-white">
        <div className="pointer-events-none absolute -right-24 -top-20 -z-10 h-64 w-64 rounded-full bg-yellow-100/80 blur-3xl sm:h-80 sm:w-80" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 -z-10 h-64 w-64 rounded-full bg-green-100/80 blur-3xl sm:h-80 sm:w-80" />

        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-9 px-4 py-10 sm:px-6 sm:py-14 md:gap-12 lg:grid-cols-2 lg:px-8 lg:py-20">
          {/* Teks hero */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: reduceMotion ? 0 : 0.1 },
              },
            }}
            className="min-w-0"
          >
            <motion.span
              variants={reveal}
              className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-800 sm:px-4 sm:text-sm"
            >
              <FiCheckCircle size={16} />
              Mengenal Roti Sajiyem
            </motion.span>

            <motion.h1
              variants={reveal}
              className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl"
            >
              Rasa yang Telah Hadir
              <span className="mt-1 block text-green-700">
                Sejak Tahun 2000
              </span>
            </motion.h1>

            <motion.p
              variants={reveal}
              className="mt-5 max-w-xl text-sm leading-7 text-gray-600 sm:text-base sm:leading-8"
            >
              Roti Sajiyem merupakan usaha yang telah hadir sejak tahun
              2000 dan menyediakan berbagai pilihan produk roti dan bolu
              untuk beragam kebutuhan pelanggan.
            </motion.p>

            <motion.div
              variants={reveal}
              className="mt-7 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:flex sm:flex-wrap"
            >
              <Link
                href="/produk"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-100"
              >
                <FiShoppingBag size={17} />
                Lihat Produk
                <FiArrowRight size={17} />
              </Link>

              <Link
                href="/rekomendasi"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-green-200 bg-white px-5 py-3 text-sm font-semibold text-green-800 transition hover:bg-green-50 focus:outline-none focus:ring-4 focus:ring-green-100"
              >
                <FiMessageCircle size={17} />
                Cari Rekomendasi
              </Link>
            </motion.div>

            <motion.div
              variants={reveal}
              className="mt-8 flex items-center gap-3 border-t border-green-100 pt-6 sm:mt-10 sm:pt-7"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-100 text-yellow-800">
                <FiCalendar size={22} />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  Perjalanan Usaha
                </p>
                <p className="mt-1 text-lg font-bold text-green-800">
                  Berdiri sejak 2000
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Gambar hero */}
          <motion.div
            initial={{
              opacity: 0,
              x: reduceMotion ? 0 : 24,
            }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.6 }}
            className="relative mx-auto w-full min-w-0 max-w-xl lg:max-w-none"
          >
            <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-green-100 via-yellow-50 to-green-50 blur-xl sm:-inset-5" />

            <div className="relative overflow-hidden rounded-2xl border border-green-100 bg-white p-2.5 shadow-xl sm:rounded-3xl sm:p-3">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-green-50 sm:rounded-2xl">
                <Image
                  src="/roti-sajiyem-sample.jpg"
                  alt="Contoh produk Bolu Gulung Roti Sajiyem"
                  fill
                  priority
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 80vw, 50vw"
                  className="object-cover object-center"
                />
              </div>

              <div className="flex items-center justify-between gap-3 px-2 py-3 sm:px-3 sm:py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-gray-900 sm:text-base">
                    Bolu Gulung
                  </p>
                  <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
                    Salah satu pilihan produk Roti Sajiyem
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-100 text-yellow-800">
                  <FiCheckCircle size={20} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SEJARAH */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-green-700 sm:text-sm">
            Perjalanan Kami
          </span>

          <h2 className="mt-3 text-2xl font-extrabold leading-tight sm:text-3xl md:text-4xl">
            Roti Sajiyem Sejak 2000
          </h2>

          <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base sm:leading-8">
            Sejak berdiri pada tahun 2000, Roti Sajiyem menyediakan
            berbagai pilihan roti dan bolu yang dapat disesuaikan dengan
            kebutuhan pelanggan. Bolu Gulung dan Mandarin termasuk produk
            yang tersedia bagi pelanggan.
          </p>
        </motion.div>

        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mx-auto mt-8 max-w-3xl sm:mt-12"
        >
          <div className="relative overflow-hidden rounded-2xl border border-green-100 bg-white p-5 shadow-sm sm:rounded-3xl sm:p-8 md:p-10">
            <div className="absolute bottom-7 left-[2.45rem] top-7 w-px bg-green-100 sm:bottom-9 sm:left-[3.15rem] sm:top-9" />

            <div className="relative flex items-start gap-4 sm:gap-6">
              <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-4 border-white bg-green-700 text-white shadow-sm sm:h-14 sm:w-14">
                <FiCalendar size={21} />
              </div>

              <div className="min-w-0 flex-1 pt-1">
                <p className="text-sm font-bold text-yellow-700">2000</p>
                <h3 className="mt-1 text-lg font-bold leading-snug text-gray-900 sm:text-xl">
                  Awal Perjalanan Roti Sajiyem
                </h3>
                <p className="mt-3 text-sm leading-7 text-gray-600">
                  Roti Sajiyem mulai menjalankan usahanya pada tahun
                  2000. Berbagai pilihan produk terus tersedia untuk
                  memenuhi kebutuhan pelanggan.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* KEUNGGULAN */}
      <section className="border-y border-green-100 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-green-700 sm:text-sm">
              Roti Sajiyem
            </span>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight sm:text-3xl md:text-4xl">
              Pilihan untuk Berbagai Kebutuhan
            </h2>
            <p className="mt-4 text-sm leading-7 text-gray-500 sm:text-base sm:leading-7">
              Jelajahi katalog dan gunakan sistem rekomendasi untuk
              membantu menemukan produk berdasarkan kebutuhan, selera,
              ukuran, dan anggaran.
            </p>
          </motion.div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const yellow = feature.theme === "yellow";

              return (
                <motion.article
                  key={feature.title}
                  variants={reveal}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    delay: reduceMotion ? 0 : index * 0.08,
                  }}
                  className="rounded-2xl border border-green-100 bg-[#f7fbea] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-md sm:p-6"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      yellow
                        ? "bg-yellow-400 text-yellow-950"
                        : "bg-green-700 text-white"
                    }`}
                  >
                    <Icon size={22} />
                  </div>

                  <h3 className="mt-5 text-base font-bold text-gray-900 sm:text-lg">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-gray-600">
                    {feature.description}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="relative isolate overflow-hidden rounded-2xl bg-green-800 px-5 py-10 text-center shadow-lg sm:rounded-3xl sm:px-10 sm:py-14 lg:px-16 lg:py-16"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 -z-10 h-48 w-48 rounded-full bg-yellow-400/20 blur-2xl sm:h-64 sm:w-64" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 -z-10 h-48 w-48 rounded-full bg-green-500/20 blur-2xl" />

          <div className="relative mx-auto max-w-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400 text-yellow-950 sm:h-16 sm:w-16">
              <FiMessageCircle size={27} />
            </div>

            <h2 className="mt-5 text-2xl font-extrabold leading-tight text-white sm:text-3xl md:text-4xl">
              Bingung Memilih Produk?
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-green-50 sm:text-base sm:leading-8">
              Gunakan sistem rekomendasi Roti Sajiyem untuk mencari
              pilihan produk sesuai kebutuhan dan anggaran Anda.
            </p>

            <Link
              href="/rekomendasi"
              className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-6 py-3 text-sm font-bold text-green-950 transition hover:bg-yellow-300 focus:outline-none focus:ring-4 focus:ring-yellow-200 sm:w-auto"
            >
              Coba Rekomendasi
              <FiArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
