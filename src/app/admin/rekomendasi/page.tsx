"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

import {
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiBarChart2,
  FiCheckCircle,
  FiChevronDown,
  FiCpu,
  FiFilter,
  FiImage,
  FiInfo,
  FiPackage,
  FiRefreshCw,
  FiSearch,
  FiSettings,
  FiSliders,
  FiStar,
  FiTag,
  FiTarget,
} from "react-icons/fi";

import { db } from "@/lib/firebase";
import {
  getRecommendations,
  RecommendationResult,
} from "@/lib/recommendation/recommend";
import { Product } from "@/types/product";

type PriceOption = {
  label: string;
  minPrice?: number;
  maxPrice?: number;
};

const priceOptions: PriceOption[] = [
  {
    label: "Semua Harga",
  },
  {
    label: "Rp12.000 - Rp25.000",
    minPrice: 12000,
    maxPrice: 25000,
  },
  {
    label: "Rp26.000 - Rp50.000",
    minPrice: 26000,
    maxPrice: 50000,
  },
  {
    label: "Rp51.000 - Rp100.000",
    minPrice: 51000,
    maxPrice: 100000,
  },
  {
    label: "Rp101.000 - Rp130.000",
    minPrice: 101000,
    maxPrice: 130000,
  },
  {
    label: "Di atas Rp130.000",
    minPrice: 130001,
  },
];

const sizeOptions = [
  "Semua Ukuran",
  "15x15",
  "18x18",
  "20x20",
  "19-20",
  "90-100",
  "Kecil",
  "Besar",
];

const occasionOptions = [
  "Semua Acara",
  "Hajatan",
  "Arisan",
  "Acara Keluarga",
  "Pengajian",
  "Oleh-oleh",
  "Acara Lainnya",
];

function formatCurrency(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

function normalizeProduct(
  id: string,
  data: Record<string, unknown>
): Product {
  return {
    id,
    name: typeof data.name === "string" ? data.name : "",
    category:
      typeof data.category === "string"
        ? data.category
        : "",
    variant:
      typeof data.variant === "string"
        ? data.variant
        : "",
    taste:
      typeof data.taste === "string"
        ? data.taste
        : "",
    filling:
      typeof data.filling === "string"
        ? data.filling
        : "",
    size:
      typeof data.size === "string"
        ? data.size
        : "",
    shape:
      typeof data.shape === "string"
        ? data.shape
        : "",
    quantity:
      typeof data.quantity === "string"
        ? data.quantity
        : "",
    occasion: Array.isArray(data.occasion)
      ? data.occasion.filter(
          (item): item is string =>
            typeof item === "string"
        )
      : typeof data.occasion === "string"
      ? data.occasion
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [],
    price:
      typeof data.price === "number"
        ? data.price
        : Number(data.price) || 0,
    description:
      typeof data.description === "string"
        ? data.description
        : "",
    imageUrl:
      typeof data.imageUrl === "string"
        ? data.imageUrl
        : "",
    isActive:
      typeof data.isActive === "boolean"
        ? data.isActive
        : true,
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}

// ==========================================
// VARIANTS ANIMASI
// ==========================================
const headerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const headerItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const headerLogoVariants = {
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

const errorVariants = {
  hidden: {
    opacity: 0,
    height: 0,
    marginBottom: 0,
    x: 0,
  },
  visible: {
    opacity: 1,
    height: "auto",
    marginBottom: 24,
    x: [0, -8, 8, -6, 6, -3, 3, 0],
    transition: {
      duration: 0.5,
      x: { duration: 0.5, ease: "easeInOut" },
      opacity: { duration: 0.3 },
      height: { duration: 0.3 },
      marginBottom: { duration: 0.3 },
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    marginBottom: 0,
    transition: { duration: 0.2 },
  },
};

const statsContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
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

const filterCardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
      staggerChildren: 0.07,
      delayChildren: 0.2,
    },
  },
};

const filterItemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const selectedCategoryVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.97,
    transition: { duration: 0.2 },
  },
};

const resultHeaderVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const resultGridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const resultCardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const methodsContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const methodCardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const footerInfoVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export default function AdminRekomendasiPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const categoryOptions = [
    "Bolu Gulung",
    "Mandarin",
    "Prol",
    "Krumpul",
    "Bolu Belah",
    "Bolu Selai",
    "Roti Kacang",
  ];

  const [selectedCategory, setSelectedCategory] =
    useState("");

  const [selectedOccasion, setSelectedOccasion] =
    useState("Semua Acara");

  const [selectedPrice, setSelectedPrice] =
    useState("Semua Harga");

  const [selectedSize, setSelectedSize] =
    useState("Semua Ukuran");

  const [recommendations, setRecommendations] =
    useState<RecommendationResult[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingRecommendation, setLoadingRecommendation] =
    useState(false);

  const [error, setError] = useState("");

  // ==========================================
  // AMBIL DATA PRODUK DARI FIRESTORE
  // ==========================================

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");

        const productsQuery = query(
          collection(db, "products"),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(
          productsQuery
        );

        const productData = snapshot.docs.map(
          (doc) =>
            normalizeProduct(
              doc.id,
              doc.data() as Record<string, unknown>
            )
        );

        setProducts(productData);


      } catch (err) {
        console.error(err);

        setError(
          "Gagal mengambil data produk dari Firestore."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // ==========================================
  // PRODUK AKTIF
  // ==========================================

  const activeProducts = useMemo(() => {
    return products.filter(
      (product) => product.isActive
    );
  }, [products]);

  // ==========================================
  // HITUNG REKOMENDASI
  // ==========================================

  function handleGenerateRecommendation() {
    if (!selectedCategory) {
      setRecommendations([]);
      return;
    }

    try {
      setLoadingRecommendation(true);

      const selectedPriceOption =
        priceOptions.find(
          (option) =>
            option.label === selectedPrice
        );

      const result =
        getRecommendations(
          selectedCategory,
          activeProducts,
          {
            occasion:
              selectedOccasion === "Semua Acara"
                ? undefined
                : selectedOccasion,

            minPrice:
              selectedPriceOption?.minPrice,

            maxPrice:
              selectedPriceOption?.maxPrice,

            size:
              selectedSize === "Semua Ukuran"
                ? undefined
                : selectedSize,
          },
          5
        );

      setRecommendations(result);
    } catch (err) {
      console.error(err);
      setRecommendations([]);
    } finally {
      setLoadingRecommendation(false);
    }
  }

  // ==========================================
  // STATISTIK
  // ==========================================

  const averageSimilarity =
    recommendations.length > 0
      ? Math.round(
          (recommendations.reduce(
            (total, item) =>
              total + item.similarity,
            0
          ) /
            recommendations.length) *
            100
        )
      : 0;

  const highestSimilarity =
    recommendations.length > 0
      ? Math.round(
          Math.max(
            ...recommendations.map(
              (item) => item.similarity
            )
          ) * 100
        )
      : 0;

  return (
    <div className="min-h-screen bg-[#f7fbea]">
      {/* ==========================================
          HEADER
      ========================================== */}

      <motion.header
        variants={headerContainerVariants}
        initial="hidden"
        animate="visible"
        className="border-b border-green-100 bg-white"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <motion.div
            variants={headerItemVariants}
            className="flex items-center gap-4"
          >
            <motion.div
              variants={headerLogoVariants}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-700 text-white shadow-sm"
            >
              <motion.span
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <FiCpu className="h-6 w-6" />
              </motion.span>
            </motion.div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  Rekomendasi Produk
                </h1>

                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-700"
                >
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <FiCheckCircle className="h-3 w-3" />
                  </motion.span>
                  Sistem Aktif
                </motion.span>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Pengujian sistem rekomendasi
                Content-Based Filtering
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={headerItemVariants}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="w-fit"
          >
            <Link
              href="/admin"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-green-100 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
            >
              <motion.span
                animate={{ x: [0, -3, 0] }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <FiArrowLeft className="h-4 w-4" />
              </motion.span>
              Kembali ke Dashboard
            </Link>
          </motion.div>
        </div>
      </motion.header>

      {/* ==========================================
          CONTENT
      ========================================== */}

      <main className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:py-8">
        {/* ERROR */}

        <AnimatePresence>
          {error && (
            <motion.div
              variants={errorVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex items-start gap-3 overflow-hidden rounded-2xl border border-red-100 bg-red-50 px-5 py-4"
            >
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="mt-0.5 shrink-0"
              >
                <FiAlertCircle className="h-5 w-5 text-red-500" />
              </motion.span>

              <div>
                <p className="text-sm font-bold text-red-700">
                  Terjadi Kesalahan
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==========================================
            STATISTIK
        ========================================== */}

        <motion.div
          variants={statsContainerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <motion.div
            variants={statCardVariants}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Total Produk
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {products.length}
                </p>
              </div>

              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-700"
              >
                <FiPackage className="h-5 w-5" />
              </motion.div>
            </div>

            <p className="mt-3 text-xs text-gray-400">
              Seluruh data produk
            </p>
          </motion.div>

          <motion.div
            variants={statCardVariants}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Produk Aktif
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {activeProducts.length}
                </p>
              </div>

              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-700"
              >
                <FiCheckCircle className="h-5 w-5" />
              </motion.div>
            </div>

            <p className="mt-3 text-xs text-gray-400">
              Produk yang digunakan sistem
            </p>
          </motion.div>

          <motion.div
            variants={statCardVariants}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="rounded-2xl border border-yellow-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Rata-rata Similarity
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {averageSimilarity}%
                </p>
              </div>

              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-50 text-yellow-700"
              >
                <FiBarChart2 className="h-5 w-5" />
              </motion.div>
            </div>

            <p className="mt-3 text-xs text-gray-400">
              Dari hasil rekomendasi
            </p>
          </motion.div>

          <motion.div
            variants={statCardVariants}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="rounded-2xl border border-yellow-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Similarity Tertinggi
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {highestSimilarity}%
                </p>
              </div>

              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-50 text-yellow-700"
              >
                <FiTarget className="h-5 w-5" />
              </motion.div>
            </div>

            <p className="mt-3 text-xs text-gray-400">
              Nilai tertinggi yang diperoleh
            </p>
          </motion.div>
        </motion.div>

        {/* ==========================================
            FILTER REKOMENDASI
        ========================================== */}

        <motion.section
          variants={filterCardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm"
        >
          <motion.div
            variants={filterItemVariants}
            className="border-b border-green-100 bg-green-50/50 px-6 py-5 sm:px-7"
          >
            <div className="flex items-start gap-3">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-green-700 shadow-sm"
              >
                <FiSliders className="h-5 w-5" />
              </motion.div>

              <div>
                <h2 className="font-bold text-gray-900">
                  Pengujian Rekomendasi
                </h2>

                <p className="mt-1 text-sm leading-5 text-gray-500">
                  Pilih kategori dan preferensi untuk
                  melihat hasil rekomendasi sistem.
                </p>
              </div>
            </div>
          </motion.div>

          <div className="p-6 sm:p-7">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {/* KATEGORI */}

              <motion.div variants={filterItemVariants}>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FiPackage className="h-4 w-4 text-green-700" />
                  Kategori Produk
                </label>

                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(event) => {
                      setSelectedCategory(
                        event.target.value
                      );
                      setRecommendations([]);
                    }}
                    disabled={loading}
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm text-gray-700 outline-none transition hover:border-green-200 focus:border-green-600 focus:bg-white focus:ring-4 focus:ring-green-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      Pilih Kategori
                    </option>

                    {categoryOptions.map(
                      (category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      )
                    )}
                  </select>

                  <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </motion.div>

              {/* ACARA */}

              <motion.div variants={filterItemVariants}>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FiStar className="h-4 w-4 text-green-700" />
                  Acara / Kebutuhan
                </label>

                <div className="relative">
                  <select
                    value={selectedOccasion}
                    onChange={(event) => {
                      setSelectedOccasion(
                        event.target.value
                      );
                      setRecommendations([]);
                    }}
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm text-gray-700 outline-none transition hover:border-green-200 focus:border-green-600 focus:bg-white focus:ring-4 focus:ring-green-50"
                  >
                    {occasionOptions.map(
                      (occasion) => (
                        <option
                          key={occasion}
                          value={occasion}
                        >
                          {occasion}
                        </option>
                      )
                    )}
                  </select>

                  <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </motion.div>

              {/* HARGA */}

              <motion.div variants={filterItemVariants}>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FiTag className="h-4 w-4 text-green-700" />
                  Rentang Harga
                </label>

                <div className="relative">
                  <select
                    value={selectedPrice}
                    onChange={(event) => {
                      setSelectedPrice(
                        event.target.value
                      );
                      setRecommendations([]);
                    }}
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm text-gray-700 outline-none transition hover:border-green-200 focus:border-green-600 focus:bg-white focus:ring-4 focus:ring-green-50"
                  >
                    {priceOptions.map(
                      (option) => (
                        <option
                          key={option.label}
                          value={option.label}
                        >
                          {option.label}
                        </option>
                      )
                    )}
                  </select>

                  <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </motion.div>

              {/* UKURAN */}

              <motion.div variants={filterItemVariants}>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FiFilter className="h-4 w-4 text-green-700" />
                  Ukuran
                </label>

                <div className="relative">
                  <select
                    value={selectedSize}
                    onChange={(event) => {
                      setSelectedSize(
                        event.target.value
                      );
                      setRecommendations([]);
                    }}
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm text-gray-700 outline-none transition hover:border-green-200 focus:border-green-600 focus:bg-white focus:ring-4 focus:ring-green-50"
                  >
                    {sizeOptions.map(
                      (size) => (
                        <option
                          key={size}
                          value={size}
                        >
                          {size}
                        </option>
                      )
                    )}
                  </select>

                  <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </motion.div>
            </div>

            {/* BUTTON */}

            <motion.div
              variants={filterItemVariants}
              className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <motion.span
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <FiInfo className="h-4 w-4 text-green-600" />
                </motion.span>

                <span>
                  Sistem akan menampilkan maksimal 5
                  rekomendasi.
                </span>
              </div>

              <motion.button
                type="button"
                onClick={
                  handleGenerateRecommendation
                }
                disabled={
                  loading ||
                  loadingRecommendation ||
                  !selectedCategory
                }
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingRecommendation ? (
                  <>
                    <FiRefreshCw className="h-4 w-4 animate-spin" />
                    Menghitung...
                  </>
                ) : (
                  <>
                    <FiSearch className="h-4 w-4" />
                    Tampilkan Rekomendasi
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
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>
        </motion.section>

        <AnimatePresence mode="wait">
          {selectedCategory && (
            <motion.section
              key={selectedCategory}
              variants={selectedCategoryVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="mt-8 overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm"
            >
              <div className="border-b border-green-100 px-6 py-5">
                <div className="flex items-center gap-2">
                  <motion.span
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <FiCheckCircle className="h-5 w-5 text-green-700" />
                  </motion.span>

                  <h2 className="font-bold text-gray-900">
                    Kategori yang Dipilih
                  </h2>
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-green-700">
                      Preferensi Utama
                    </p>

                    <h3 className="mt-1 text-xl font-bold text-gray-900">
                      {selectedCategory}
                    </h3>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                      Kategori digunakan sebagai preferensi awal.
                      Sistem kemudian mencari produk dengan karakteristik
                      paling mirip menggunakan TF-IDF dan Cosine Similarity.
                    </p>
                  </div>

                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex w-fit items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-xs font-bold text-green-700"
                  >
                    <FiTarget className="h-4 w-4" />
                    Preferensi Kategori
                  </motion.div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ==========================================
            HASIL REKOMENDASI
        ========================================== */}

        <section className="mt-8">
          <motion.div
            variants={resultHeaderVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-700 text-white"
                >
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <FiStar className="h-4 w-4" />
                  </motion.span>
                </motion.div>

                <h2 className="text-lg font-bold text-gray-900">
                  Hasil Rekomendasi
                </h2>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                Maksimal 5 produk dengan tingkat
                kemiripan tertinggi.
              </p>
            </div>

            <AnimatePresence>
              {recommendations.length > 0 && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex w-fit items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700"
                >
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <FiCheckCircle className="h-3.5 w-3.5" />
                  </motion.span>
                  {recommendations.length} hasil
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          <AnimatePresence mode="wait">
            {recommendations.length === 0 ? (
              <motion.div
                key="empty"
                variants={selectedCategoryVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="rounded-2xl border border-green-100 bg-white px-6 py-16 text-center shadow-sm"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-700"
                >
                  <FiSearch className="h-7 w-7" />
                </motion.div>

                <h3 className="mt-5 font-bold text-gray-900">
                  Belum Ada Hasil Rekomendasi
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                  Pilih kategori dan filter preferensi,
                  kemudian klik &quot;Tampilkan
                  Rekomendasi&quot; untuk menjalankan
                  sistem.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                variants={resultGridVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
              >
                {recommendations.map(
                  (
                    recommendation,
                    index
                  ) => {
                    const similarity =
                      Math.round(
                        recommendation.similarity *
                          100
                      );

                    return (
                      <motion.div
                        key={
                          recommendation.product
                            .id
                        }
                        variants={resultCardVariants}
                        whileHover={{ y: -8 }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 20,
                        }}
                        className="group overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm transition hover:shadow-lg"
                      >
                        {/* IMAGE */}

                        <div className="relative h-56 overflow-hidden bg-green-50">
                          {recommendation
                            .product
                            .imageUrl ? (
                            <motion.img
                              src={
                                recommendation
                                  .product
                                  .imageUrl
                              }
                              alt={
                                recommendation
                                  .product
                                  .name
                              }
                              whileHover={{ scale: 1.08 }}
                              transition={{ duration: 0.5 }}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
                              <FiImage className="h-8 w-8" />

                              <span className="text-xs">
                                Tidak ada gambar
                              </span>
                            </div>
                          )}

                          {/* RANK */}

                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              duration: 0.4,
                              delay: 0.1,
                            }}
                            className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-green-800 shadow-sm"
                          >
                            <motion.span
                              animate={{ rotate: [0, 15, -15, 0] }}
                              transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                            >
                              <FiStar className="h-3.5 w-3.5 text-yellow-500" />
                            </motion.span>
                            Ranking #{index + 1}
                          </motion.div>

                          {/* SIMILARITY */}

                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              duration: 0.4,
                              delay: 0.2,
                            }}
                            className="absolute right-3 top-3 rounded-full bg-green-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm"
                          >
                            {similarity}% mirip
                          </motion.div>
                        </div>

                        {/* CONTENT */}

                        <div className="p-5">
                          <p className="text-xs font-bold uppercase tracking-wider text-green-700">
                            {
                              recommendation
                                .product
                                .category
                            }
                          </p>

                          <h3 className="mt-1 text-lg font-bold text-gray-900">
                            {
                              recommendation
                                .product
                                .name
                            }
                          </h3>

                          {recommendation
                            .product
                            .variant && (
                            <p className="mt-1 text-sm text-gray-500">
                              {
                                recommendation
                                  .product
                                  .variant
                              }
                            </p>
                          )}

                          <p className="mt-3 text-base font-bold text-green-700">
                            {formatCurrency(
                              recommendation
                                .product
                                .price
                            )}
                          </p>

                          <div className="mt-4 space-y-2">
                            {recommendation
                              .product
                              .taste && (
                              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                                <span className="text-xs font-medium text-gray-500">
                                  Rasa
                                </span>

                                <span className="text-xs font-semibold text-gray-800">
                                  {
                                    recommendation
                                      .product
                                      .taste
                                  }
                                </span>
                              </div>
                            )}

                            {recommendation
                              .product
                              .filling && (
                              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                                <span className="text-xs font-medium text-gray-500">
                                  Isian
                                </span>

                                <span className="text-xs font-semibold text-gray-800">
                                  {
                                    recommendation
                                      .product
                                      .filling
                                  }
                                </span>
                              </div>
                            )}

                            {recommendation
                              .product
                              .size && (
                              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                                <span className="text-xs font-medium text-gray-500">
                                  Ukuran
                                </span>

                                <span className="text-xs font-semibold text-gray-800">
                                  {
                                    recommendation
                                      .product
                                      .size
                                  }
                                </span>
                              </div>
                            )}
                          </div>

                          {/* SIMILARITY BAR */}

                          <div className="mt-5">
                            <div className="mb-2 flex items-center justify-between text-xs">
                              <span className="font-semibold text-gray-600">
                                Tingkat Kemiripan
                              </span>

                              <span className="font-bold text-green-700">
                                {similarity}%
                              </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-green-50">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${similarity}%`,
                                }}
                                transition={{
                                  duration: 0.8,
                                  delay: 0.3,
                                  ease: "easeOut",
                                }}
                                className="h-full rounded-full bg-green-700"
                              />
                            </div>
                          </div>

                          {/* DETAIL */}

                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Link
                              href={`/produk/${recommendation.product.id}`}
                              target="_blank"
                              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-green-100 bg-white px-4 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-50"
                            >
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
                        </div>
                      </motion.div>
                    );
                  }
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ==========================================
            INFORMASI ALGORITMA
        ========================================== */}

        <motion.section
          variants={selectedCategoryVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-8 overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm"
        >
          <div className="border-b border-green-100 bg-green-50/50 px-6 py-5">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-green-700 shadow-sm"
              >
                <FiSettings className="h-5 w-5" />
              </motion.div>

              <div>
                <h2 className="font-bold text-gray-900">
                  Metode Rekomendasi
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Tahapan metode yang digunakan sistem.
                </p>
              </div>
            </div>
          </div>

          <motion.div
            variants={methodsContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-4 p-6 md:grid-cols-3"
          >
            <motion.div
              variants={methodCardVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="rounded-2xl border border-green-100 bg-green-50/50 p-5"
            >
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-green-700 shadow-sm"
              >
                <FiFilter className="h-5 w-5" />
              </motion.div>

              <p className="mt-4 text-sm font-bold text-gray-900">
                1. Content-Based Filtering
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Rekomendasi diberikan berdasarkan
                kemiripan karakteristik antar produk.
              </p>
            </motion.div>

            <motion.div
              variants={methodCardVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="rounded-2xl border border-yellow-100 bg-yellow-50/50 p-5"
            >
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-yellow-700 shadow-sm"
              >
                <FiBarChart2 className="h-5 w-5" />
              </motion.div>

              <p className="mt-4 text-sm font-bold text-gray-900">
                2. TF-IDF
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Digunakan untuk memberikan bobot pada
                atribut produk seperti kategori, varian,
                rasa, isian, ukuran, dan atribut lainnya.
              </p>
            </motion.div>

            <motion.div
              variants={methodCardVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="rounded-2xl border border-green-100 bg-green-50/50 p-5"
            >
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-green-700 shadow-sm"
              >
                <FiTarget className="h-5 w-5" />
              </motion.div>

              <p className="mt-4 text-sm font-bold text-gray-900">
                3. Cosine Similarity
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Digunakan untuk menghitung tingkat
                kemiripan antara profil kategori dan
                karakteristik produk.
              </p>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Footer info */}
        <motion.div
          variants={footerInfoVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-6 flex flex-col gap-2 border-t border-green-100 pt-5 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between"
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
              <FiCpu className="h-4 w-4 text-green-600" />
            </motion.span>
            <span>
              Sistem Rekomendasi Produk Roti Sajiyem
            </span>
          </div>

          <div className="flex items-center gap-2">
            <motion.span
              animate={{ scale: [1, 1.15, 1] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <FiCheckCircle className="h-4 w-4 text-green-600" />
            </motion.span>
            <span>
              Content-Based Filtering
            </span>
          </div>
        </motion.div>
      </main>
    </div>
  );
}