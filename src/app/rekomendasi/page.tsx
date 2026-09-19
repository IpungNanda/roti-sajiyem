"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";

import {
  FiArrowRight,
  FiCheckCircle,
  FiDollarSign,
  FiFilter,
  FiInfo,
  FiRefreshCw,
  FiSearch,
  FiShoppingBag,
  FiSliders,
  FiStar,
  FiTag,
} from "react-icons/fi";

import { db } from "@/lib/firebase";
import { Product } from "@/types/product";
import {
  getRecommendations,
  RecommendationResult,
} from "@/lib/recommendation/recommend";
import { similarityToPercentage } from "@/lib/recommendation/cosineSimilarity";

const categoryOptions = [
  "Bolu Gulung",
  "Mandarin",
  "Prol",
  "Krumpul",
  "Bolu Belah",
  "Bolu Selai",
  "Roti Kacang",
];

const occasionOptions = [
  "Hajatan",
  "Arisan",
  "Acara Keluarga",
  "Pengajian",
  "Oleh-oleh",
  "Acara Lainnya",
];

const priceOptions = [
  {
    label: "Semua Harga",
    min: undefined,
    max: undefined,
  },
  {
    label: "Rp12.000 - Rp25.000",
    min: 12000,
    max: 25000,
  },
  {
    label: "Rp26.000 - Rp50.000",
    min: 26000,
    max: 50000,
  },
  {
    label: "Rp51.000 - Rp100.000",
    min: 51000,
    max: 100000,
  },
  {
    label: "Rp101.000 - Rp130.000",
    min: 101000,
    max: 130000,
  },
  {
    label: "Di atas Rp130.000",
    min: 130001,
    max: undefined,
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

// ==========================================
// VARIANTS ANIMASI
// ==========================================
const heroContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const heroItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const heroIconVariants = {
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

const badgeContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.4,
    },
  },
};

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const formCardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const formItemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

const errorVariants = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    marginTop: 20,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    height: 0,
    marginTop: 0,
    transition: { duration: 0.2, ease: "easeIn" as const },
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

const infoVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function RekomendasiPage() {
  const [products, setProducts] = useState<Product[]>([]);

  const [selectedCategory, setSelectedCategory] =
    useState("");

  const [selectedOccasion, setSelectedOccasion] =
    useState("");

  const [selectedPrice, setSelectedPrice] =
    useState("Semua Harga");

  const [selectedSize, setSelectedSize] =
    useState("Semua Ukuran");

  const [recommendations, setRecommendations] =
    useState<RecommendationResult[]>([]);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // MENGAMBIL PRODUK DARI FIRESTORE
  // ==========================================

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");

        const snapshot = await getDocs(
          collection(db, "products")
        );

        const productData: Product[] = snapshot.docs
          .map((doc) => {
            const data = doc.data();

            return {
              id: doc.id,
              name: data.name || "",
              category: data.category || "",
              variant: data.variant || "",
              taste: data.taste || "",
              filling: data.filling || "",
              size: data.size || "",
              shape: data.shape || "",
              quantity: data.quantity || "",

              occasion: Array.isArray(data.occasion)
                ? data.occasion
                : typeof data.occasion === "string"
                ? data.occasion
                    .split(",")
                    .map((item: string) => item.trim())
                    .filter(Boolean)
                : [],

              price: Number(data.price) || 0,
              description: data.description || "",
              imageUrl: data.imageUrl || "",
              isActive: data.isActive === true,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            };
          })
          .filter((product) => product.isActive);

        setProducts(productData);
      } catch (err) {
        console.error(err);

        setError(
          "Gagal mengambil data produk. Silakan coba lagi."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // ==========================================
  // PROSES REKOMENDASI
  // ==========================================

  function handleRecommendation() {
    setError("");
    setRecommendations([]);

    if (!selectedCategory) {
      setError(
        "Silakan pilih kategori produk terlebih dahulu."
      );
      return;
    }

    const selectedPriceOption = priceOptions.find(
      (option) => option.label === selectedPrice
    );

    try {
      setProcessing(true);

      /*
       * Sistem sekarang langsung menggunakan
       * kategori yang dipilih pengguna sebagai
       * input utama sistem rekomendasi.
       */
      const result = getRecommendations(
        selectedCategory,
        products,
        {
          occasion:
            selectedOccasion || undefined,

          minPrice:
            selectedPriceOption?.min,

          maxPrice:
            selectedPriceOption?.max,

          size:
            selectedSize !== "Semua Ukuran"
              ? selectedSize
              : undefined,
        },
        5
      );

      setRecommendations(result);

      if (result.length === 0) {
        setError(
          "Belum ditemukan produk yang sesuai dengan pilihan Anda."
        );
      }
    } catch (err) {
      console.error(err);

      setError(
        "Terjadi kesalahan saat menghitung rekomendasi."
      );
    } finally {
      setProcessing(false);
    }
  }

  // ==========================================
  // FORMAT HARGA
  // ==========================================

  function formatCurrency(price: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  }

  // ==========================================
  // RESET
  // ==========================================

  function handleReset() {
    setSelectedCategory("");
    setSelectedOccasion("");
    setSelectedPrice("Semua Harga");
    setSelectedSize("Semua Ukuran");
    setRecommendations([]);
    setError("");
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <main className="min-h-screen bg-[#f7fbea]">
      {/* ==========================================
          HERO
      ========================================== */}

      <section className="relative overflow-hidden border-b border-green-100 bg-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-yellow-100/70 blur-3xl"
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-green-100/80 blur-3xl"
        />

        <motion.div
          variants={heroContainerVariants}
          initial="hidden"
          animate="visible"
          className="relative mx-auto max-w-6xl px-5 py-14 text-center sm:px-8 lg:py-20"
        >
          <motion.div
            variants={heroIconVariants}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-700 text-white shadow-lg"
          >
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <FiSearch className="h-7 w-7" />
            </motion.span>
          </motion.div>

          <motion.p
            variants={heroItemVariants}
            className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-green-700"
          >
            Sistem Rekomendasi Roti Sajiyem
          </motion.p>

          <motion.h1
            variants={heroItemVariants}
            className="mt-3 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl"
          >
            Temukan Roti yang Sesuai
            <span className="block text-green-700">
              dengan Kebutuhan Anda
            </span>
          </motion.h1>

          <motion.p
            variants={heroItemVariants}
            className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base"
          >
            Pilih kategori produk yang Anda sukai, tentukan
            kebutuhan acara, budget, dan ukuran. Sistem akan
            membantu menemukan produk Roti Sajiyem yang
            memiliki karakteristik paling sesuai.
          </motion.p>

          <motion.div
            variants={badgeContainerVariants}
            initial="hidden"
            animate="visible"
            className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-3"
          >
            <motion.div
              variants={badgeVariants}
              whileHover={{ scale: 1.05, y: -2 }}
              className="flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-4 py-2 text-xs font-medium text-green-700"
            >
              <FiCheckCircle className="h-4 w-4" />
              Sesuai Karakteristik
            </motion.div>

            <motion.div
              variants={badgeVariants}
              whileHover={{ scale: 1.05, y: -2 }}
              className="flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-4 py-2 text-xs font-medium text-yellow-800"
            >
              <FiDollarSign className="h-4 w-4" />
              Sesuai Budget
            </motion.div>

            <motion.div
              variants={badgeVariants}
              whileHover={{ scale: 1.05, y: -2 }}
              className="flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-4 py-2 text-xs font-medium text-green-700"
            >
              <FiSliders className="h-4 w-4" />
              Sesuai Kebutuhan
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ==========================================
          FORM REKOMENDASI
      ========================================== */}

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-12">
        <motion.div
          variants={formCardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="overflow-hidden rounded-3xl border border-green-100 bg-white shadow-sm"
        >
          {/* FORM HEADER */}

          <motion.div
            variants={formItemVariants}
            className="border-b border-green-100 bg-green-50/70 px-6 py-6 md:px-8"
          >
            <div className="flex items-start gap-4">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-700 text-white shadow-sm"
              >
                <FiFilter className="h-5 w-5" />
              </motion.div>

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Tentukan Kebutuhan Anda
                </h2>

                <p className="mt-1 text-sm leading-6 text-gray-500">
                  Pilih kategori produk dan isi pilihan
                  berikut untuk mendapatkan rekomendasi.
                </p>
              </div>
            </div>
          </motion.div>

          {/* FORM BODY */}

          <div className="p-6 md:p-8">
            <div className="grid gap-6 md:grid-cols-2">
              {/* KATEGORI PRODUK */}

              <motion.div
                variants={formItemVariants}
                className="md:col-span-2"
              >
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FiShoppingBag className="h-4 w-4 text-green-700" />
                  Kategori Produk yang Anda Sukai *
                </label>

                <p className="mb-3 text-xs leading-5 text-gray-500">
                  Pilih kategori produk yang paling Anda
                  sukai sebagai dasar sistem dalam memberikan
                  rekomendasi.
                </p>

                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setRecommendations([]);
                    setError("");
                  }}
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                >
                  <option value="">
                    -- Pilih Kategori Produk --
                  </option>

                  {categoryOptions.map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </motion.div>

              {/* ACARA */}

              <motion.div variants={formItemVariants}>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Untuk Acara Apa?
                </label>

                <select
                  value={selectedOccasion}
                  onChange={(e) => {
                    setSelectedOccasion(e.target.value);
                    setRecommendations([]);
                    setError("");
                  }}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                >
                  <option value="">
                    Semua Acara
                  </option>

                  {occasionOptions.map((occasion) => (
                    <option
                      key={occasion}
                      value={occasion}
                    >
                      {occasion}
                    </option>
                  ))}
                </select>
              </motion.div>

              {/* HARGA */}

              <motion.div variants={formItemVariants}>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Range Harga
                </label>

                <select
                  value={selectedPrice}
                  onChange={(e) => {
                    setSelectedPrice(e.target.value);
                    setRecommendations([]);
                    setError("");
                  }}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                >
                  {priceOptions.map((option) => (
                    <option
                      key={option.label}
                      value={option.label}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </motion.div>

              {/* UKURAN */}

              <motion.div
                variants={formItemVariants}
                className="md:col-span-2"
              >
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Ukuran
                </label>

                <select
                  value={selectedSize}
                  onChange={(e) => {
                    setSelectedSize(e.target.value);
                    setRecommendations([]);
                    setError("");
                  }}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                >
                  {sizeOptions.map((size) => (
                    <option
                      key={size}
                      value={size}
                    >
                      {size}
                    </option>
                  ))}
                </select>
              </motion.div>
            </div>

            {/* BUTTON */}

            <motion.div
              variants={formItemVariants}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <motion.button
                type="button"
                onClick={handleRecommendation}
                disabled={
                  processing ||
                  loading ||
                  products.length === 0
                }
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {processing ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-200 border-t-white" />
                    Mencari Rekomendasi...
                  </>
                ) : (
                  <>
                    <FiSearch className="h-4 w-4" />
                    Tampilkan Rekomendasi
                  </>
                )}
              </motion.button>

              <motion.button
                type="button"
                onClick={handleReset}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-6 py-3.5 text-sm font-semibold text-gray-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
              >
                <motion.span
                  whileHover={{ rotate: -180 }}
                  transition={{ duration: 0.4 }}
                >
                  <FiRefreshCw className="h-4 w-4" />
                </motion.span>
                Reset
              </motion.button>
            </motion.div>

            {/* ERROR */}

            <AnimatePresence>
              {error && (
                <motion.div
                  variants={errorVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex items-start gap-3 overflow-hidden rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700"
                >
                  <FiInfo className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ==========================================
            KATEGORI YANG DIPILIH
        ========================================== */}

        <AnimatePresence mode="wait">
          {selectedCategory && (
            <motion.div
              key={selectedCategory}
              variants={selectedCategoryVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="mt-8 overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm"
            >
              <div className="border-b border-green-100 bg-green-50/50 px-6 py-4">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-green-700">
                  <FiCheckCircle className="h-4 w-4" />
                  Kategori yang Dipilih
                </p>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4">
                  <motion.div
                    initial={{ scale: 0.6, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      delay: 0.1,
                    }}
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-700 text-white"
                  >
                    <FiShoppingBag className="h-6 w-6" />
                  </motion.div>

                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      Kategori Produk
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-gray-900">
                      {selectedCategory}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Kategori ini digunakan sebagai dasar
                      pencarian rekomendasi.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==========================================
            HASIL REKOMENDASI
        ========================================== */}

        <AnimatePresence>
          {recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-14"
            >
              <motion.div
                variants={resultHeaderVariants}
                initial="hidden"
                animate="visible"
                className="mb-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0.6, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    delay: 0.15,
                  }}
                  className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-yellow-700"
                >
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <FiStar className="h-5 w-5" />
                  </motion.span>
                </motion.div>

                <p className="mt-4 text-sm font-bold uppercase tracking-[0.18em] text-green-700">
                  Hasil Rekomendasi
                </p>

                <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                  Rekomendasi Untuk Anda
                </h2>

                <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
                  Berikut produk yang paling sesuai berdasarkan
                  kategori dan pilihan karakteristik produk.
                </p>
              </motion.div>

              <motion.div
                variants={resultGridVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {recommendations.map(
                  ({ product, similarity }) => {
                    const percentage =
                      similarityToPercentage(similarity);

                    return (
                      <motion.div
                        key={product.id}
                        variants={resultCardVariants}
                        whileHover={{ y: -8 }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 20,
                        }}
                        className="group overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm transition hover:shadow-lg"
                      >
                        {/* GAMBAR */}

                        <div className="relative h-56 overflow-hidden bg-gray-100">
                          {product.imageUrl ? (
                            <motion.img
                              src={product.imageUrl}
                              alt={product.name}
                              whileHover={{ scale: 1.08 }}
                              transition={{ duration: 0.5 }}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm text-gray-400">
                              Tidak ada gambar
                            </div>
                          )}

                          {/* SCORE */}

                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              duration: 0.4,
                              delay: 0.2,
                            }}
                            className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-green-700 px-3 py-1.5 text-xs font-bold text-white shadow-md"
                          >
                            <FiCheckCircle className="h-3.5 w-3.5" />
                            {percentage}% mirip
                          </motion.div>
                        </div>

                        {/* INFO */}

                        <div className="p-5">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-bold uppercase tracking-wide text-green-700">
                              {product.category}
                            </p>

                            <motion.span
                              whileHover={{ rotate: 15, scale: 1.15 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <FiTag className="h-4 w-4 text-yellow-500" />
                            </motion.span>
                          </div>

                          <h3 className="mt-2 text-lg font-bold text-gray-900">
                            {product.name}
                          </h3>

                          {product.variant && (
                            <p className="mt-1 text-sm text-gray-500">
                              {product.variant}
                            </p>
                          )}

                          <div className="mt-4 space-y-2">
                            {product.taste && (
                              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs">
                                <span className="text-gray-500">
                                  Rasa
                                </span>

                                <span className="font-medium text-gray-800">
                                  {product.taste}
                                </span>
                              </div>
                            )}

                            {product.filling && (
                              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs">
                                <span className="text-gray-500">
                                  Isian
                                </span>

                                <span className="font-medium text-gray-800">
                                  {product.filling}
                                </span>
                              </div>
                            )}

                            {product.size && (
                              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs">
                                <span className="text-gray-500">
                                  Ukuran
                                </span>

                                <span className="font-medium text-gray-800">
                                  {product.size}
                                </span>
                              </div>
                            )}

                            {product.quantity && (
                              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs">
                                <span className="text-gray-500">
                                  Jumlah
                                </span>

                                <span className="font-medium text-gray-800">
                                  {product.quantity}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* HARGA */}

                          <div className="mt-5 flex items-end justify-between gap-3">
                            <div>
                              <p className="text-xs text-gray-400">
                                Harga
                              </p>

                              <p className="mt-1 text-lg font-bold text-green-700">
                                {formatCurrency(product.price)}
                              </p>
                            </div>
                          </div>

                          {/* DETAIL */}

                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Link
                              href={`/produk/${product.id}`}
                              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
                            >
                              Lihat Detail
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==========================================
            INFORMASI ALGORITMA
        ========================================== */}

        <AnimatePresence>
          {!loading &&
            !processing &&
            recommendations.length === 0 &&
            !error && (
              <motion.div
                variants={infoVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -10 }}
                className="mt-10 rounded-2xl border border-green-100 bg-white p-6"
              >
                <div className="flex items-start gap-4">
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-100 text-yellow-700"
                  >
                    <FiInfo className="h-5 w-5" />
                  </motion.div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      Cara Kerja Sistem Rekomendasi
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      Sistem menggunakan kategori, varian,
                      rasa, isian, ukuran, bentuk, jumlah,
                      kebutuhan acara, dan harga untuk menemukan
                      produk yang memiliki karakteristik serupa
                      dengan pilihan Anda.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
        </AnimatePresence>
      </section>
    </main>
  );
}