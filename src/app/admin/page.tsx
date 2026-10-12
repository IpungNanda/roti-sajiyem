
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  FiArrowRight,
  FiBarChart2,
  FiCheckCircle,
  FiGlobe,
  FiInfo,
  FiMessageCircle,
  FiPackage,
  FiSettings,
  FiShoppingBag,
  FiStar,
} from "react-icons/fi";

import { db } from "@/lib/firebase";

type ProductStats = {
  total: number;
  active: number;
};

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const quickMenus = [
  {
    title: "Kelola Produk",
    description:
      "Tambahkan, ubah, dan kelola informasi produk Roti Sajiyem.",
    href: "/admin/produk",
    label: "Buka menu produk",
    icon: FiShoppingBag,
    accent: "green",
  },
  {
    title: "Sistem Rekomendasi",
    description:
      "Lihat dan uji hasil rekomendasi produk berdasarkan karakteristiknya.",
    href: "/admin/rekomendasi",
    label: "Buka rekomendasi",
    icon: FiStar,
    accent: "yellow",
  },
  {
    title: "Lihat Website",
    description:
      "Periksa tampilan website Roti Sajiyem dari sisi pelanggan.",
    href: "/",
    label: "Buka website",
    icon: FiGlobe,
    accent: "green",
    external: true,
  },
];

export default function AdminPage() {
  const [stats, setStats] = useState<ProductStats>({
    total: 0,
    active: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function fetchProductStats() {
      try {
        setLoadingStats(true);
        setStatsError("");

        const snapshot = await getDocs(collection(db, "products"));

        if (!mounted) return;

        const products = snapshot.docs.map((item) => item.data());

        setStats({
          total: products.length,
          active: products.filter(
            (product) => product.isActive === true
          ).length,
        });
      } catch (error) {
        console.error("Gagal mengambil statistik produk:", error);

        if (mounted) {
          setStatsError("Statistik produk tidak dapat dimuat.");
        }
      } finally {
        if (mounted) setLoadingStats(false);
      }
    }

    void fetchProductStats();

    return () => {
      mounted = false;
    };
  }, []);

  const statisticCards = [
    {
      title: "Total Produk",
      value: loadingStats ? "..." : String(stats.total),
      description: "Seluruh produk dalam database",
      icon: FiPackage,
      iconClass: "bg-green-50 text-green-700",
    },
    {
      title: "Produk Aktif",
      value: loadingStats ? "..." : String(stats.active),
      description: "Produk dengan status aktif",
      icon: FiCheckCircle,
      iconClass: "bg-yellow-50 text-yellow-700",
    },
    {
      title: "Sistem Rekomendasi",
      value: "Content-Based",
      description: "TF-IDF dan Cosine Similarity",
      icon: FiStar,
      iconClass: "bg-green-50 text-green-700",
    },
    {
      title: "Pemesanan",
      value: "WhatsApp",
      description: "Saluran komunikasi pelanggan",
      icon: FiMessageCircle,
      iconClass: "bg-yellow-50 text-yellow-700",
    },
  ];

  return (
    <main className="min-h-screen min-w-0 bg-[#f7fbea]">
      {/* Header halaman */}
      <header className="sticky top-16 z-20 border-b border-green-100 bg-white/95 backdrop-blur lg:top-0">
        <div className="mx-auto flex min-h-[76px] max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <FiBarChart2 className="h-5 w-5 shrink-0 text-green-700" />
              <h1 className="truncate text-lg font-bold text-gray-900 sm:text-xl">
                Dashboard
              </h1>
            </div>
            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              Ringkasan pengelolaan Roti Sajiyem
            </p>
          </div>

          <div className="hidden items-center gap-3 rounded-xl border border-green-100 bg-white px-3 py-2 sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 font-bold text-green-800">
              A
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Administrator
              </p>
              <p className="text-xs text-gray-500">Roti Sajiyem</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1600px] space-y-8 px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
        {/* Welcome banner */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative isolate overflow-hidden rounded-2xl bg-green-800 p-5 text-white shadow-sm sm:rounded-3xl sm:p-8 lg:p-10"
        >
          <div className="pointer-events-none absolute -right-10 -top-16 -z-10 h-48 w-48 rounded-full bg-yellow-400/20 blur-3xl sm:h-64 sm:w-64" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 -z-10 h-48 w-48 rounded-full bg-green-400/20 blur-3xl" />

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-green-50">
              <FiSettings size={15} />
              Panel Administrator
            </div>

            <h2 className="mt-5 text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
              Kelola Roti Sajiyem
              <span className="block text-yellow-300">
                dengan Lebih Mudah
              </span>
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-green-50 sm:text-base sm:leading-7">
              Kelola informasi produk, harga, rasa, ukuran, dan akses
              sistem rekomendasi melalui satu panel administrator.
            </p>

            <Link
              href="/admin/produk"
              className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 text-sm font-bold text-green-950 transition hover:bg-yellow-300 focus:outline-none focus:ring-4 focus:ring-yellow-200"
            >
              <FiShoppingBag size={18} />
              Kelola Produk
              <FiArrowRight size={17} />
            </Link>
          </div>
        </motion.section>

        {/* Statistics */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Ringkasan Sistem
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Informasi singkat mengenai pengelolaan produk.
            </p>
          </div>

          {statsError && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {statsError} Periksa koneksi Firebase dan Firestore Rules.
            </div>
          )}

          <motion.div
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.08 },
              },
            }}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            {statisticCards.map((card) => {
              const Icon = card.icon;

              return (
                <motion.article
                  key={card.title}
                  variants={cardVariants}
                  transition={{ duration: 0.3 }}
                  className="min-w-0 rounded-2xl border border-green-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-500">
                        {card.title}
                      </p>
                      <p className="mt-3 break-words text-2xl font-bold text-gray-900 sm:text-3xl">
                        {card.value}
                      </p>
                    </div>

                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.iconClass}`}
                    >
                      <Icon size={22} />
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-5 text-gray-500 sm:text-sm">
                    {card.description}
                  </p>
                </motion.article>
              );
            })}
          </motion.div>
        </section>

        {/* Quick menus */}
        <section>
          <div className="mb-5">
            <div className="flex items-center gap-2">
              <FiBarChart2 className="h-5 w-5 text-green-700" />
              <h2 className="text-lg font-bold text-gray-900">
                Menu Cepat
              </h2>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Pilih fitur yang ingin kamu kelola.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {quickMenus.map((menu, index) => {
              const Icon = menu.icon;
              const isYellow = menu.accent === "yellow";

              return (
                <motion.article
                  key={menu.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.3, delay: index * 0.06 }}
                  className="min-w-0 rounded-2xl border border-green-100 bg-white p-5 shadow-sm transition hover:border-green-200 hover:shadow-md sm:p-6"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      isYellow
                        ? "bg-yellow-50 text-yellow-700"
                        : "bg-green-50 text-green-700"
                    }`}
                  >
                    <Icon size={24} />
                  </div>

                  <h3 className="mt-5 text-base font-bold text-gray-900">
                    {menu.title}
                  </h3>

                  <p className="mt-2 min-h-[48px] text-sm leading-6 text-gray-500">
                    {menu.description}
                  </p>

                  <Link
                    href={menu.href}
                    target={menu.external ? "_blank" : undefined}
                    rel={menu.external ? "noreferrer" : undefined}
                    className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-900"
                  >
                    {menu.label}
                    <FiArrowRight size={16} />
                  </Link>
                </motion.article>
              );
            })}
          </div>
        </section>

        {/* System information */}
        <section className="rounded-2xl border border-yellow-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-50 text-yellow-700">
              <FiInfo size={23} />
            </div>

            <div className="min-w-0">
              <h2 className="font-bold text-gray-900">
                Informasi Sistem
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Dashboard digunakan untuk mengelola produk Roti
                Sajiyem. Data produk tersimpan di Firebase Firestore,
                sedangkan gambar produk menggunakan URL gambar yang
                dikelola melalui Cloudinary.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-green-100 py-5">
          <div className="flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
            <div className="flex items-center gap-2 text-sm font-semibold text-green-800">
              <FiCheckCircle size={16} />
              Roti Sajiyem
            </div>

            <p className="text-xs leading-5 text-gray-400">
              © {new Date().getFullYear()} Roti Sajiyem. Sistem
              Informasi dan Rekomendasi Produk.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
