"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";

import {
  FiAlertCircle,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiPackage,
  FiRefreshCw,
  FiSearch,
  FiShoppingBag,
  FiTag,
  FiX,
} from "react-icons/fi";

import { db } from "@/lib/firebase";

type Product = {
  id: string;
  name: string;
  category: string;
  variant: string;
  taste: string;
  filling: string;
  size: string;
  shape: string;
  quantity: string;
  price: number;
  description: string;
  imageUrl: string;
  isActive: boolean;
};

// ==========================================
// VARIANTS ANIMASI
// ==========================================
const headerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const headerItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const headerIconVariants = {
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

const stateCardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.97,
    transition: { duration: 0.2 },
  },
};

const errorCardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

const searchBarVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const gridHeaderVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const productCardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
};

const infoSectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function ProdukPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // ==========================================
  // STATE PENCARIAN
  // ==========================================
  const [searchQuery, setSearchQuery] = useState("");

  // ==========================================
  // Mengambil data produk dari Firestore
  // ==========================================

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const productsRef = collection(db, "products");

        const snapshot = await getDocs(productsRef);

        const productData: Product[] = snapshot.docs
          .map((product) => {
            const data = product.data();

            return {
              id: product.id,
              name: data.name || "",
              category: data.category || "",
              variant: data.variant || "",
              taste: data.taste || "",
              filling: data.filling || "",
              size: data.size || "",
              shape: data.shape || "",
              quantity: data.quantity || "",
              price: Number(data.price || 0),
              description: data.description || "",
              imageUrl: data.imageUrl || "",
              isActive: data.isActive ?? true,
            };
          })
          .filter((product) => product.isActive);

        setProducts(productData);
      } catch (error) {
        console.error("Gagal mengambil data produk:", error);

        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Gagal mengambil data produk.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ==========================================
  // FILTER PRODUK BERDASARKAN PENCARIAN
  // ==========================================
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) => {
      const searchable = [
        product.name,
        product.category,
        product.variant,
        product.taste,
        product.filling,
        product.size,
        product.shape,
        product.quantity,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [products, searchQuery]);

  // ==========================================
  // RESET PENCARIAN
  // ==========================================
  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <main className="min-h-screen bg-[#f7fbea]">
      {/* ==========================================
          HEADER
      ========================================== */}

      <section className="relative overflow-hidden border-b border-green-100 bg-white">
        {/* Decorative Background */}
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
          className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-green-100/70 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:py-14">
          <motion.div
            variants={headerContainerVariants}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-2xl text-center"
          >
            <motion.div
              variants={headerIconVariants}
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-green-700 text-white shadow-md sm:h-14 sm:w-14 sm:rounded-2xl"
            >
              <motion.span
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <FiShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
              </motion.span>
            </motion.div>

            <motion.p
              variants={headerItemVariants}
              className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-green-700 sm:text-sm"
            >
              Roti Sajiyem
            </motion.p>

            <motion.h1
              variants={headerItemVariants}
              className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl lg:text-5xl"
            >
              Produk Kami
            </motion.h1>

            <motion.p
              variants={headerItemVariants}
              className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-600 sm:mt-4 sm:leading-7 sm:text-base"
            >
              Temukan berbagai pilihan produk Roti Sajiyem
              yang dapat disesuaikan dengan selera, kebutuhan,
              dan anggaran Anda.
            </motion.p>
          </motion.div>

          {/* INFO */}
          <motion.div
            variants={badgeContainerVariants}
            initial="hidden"
            animate="visible"
            className="mx-auto mt-6 flex max-w-2xl flex-wrap justify-center gap-2 sm:mt-8 sm:gap-3"
          >
            <motion.div
              variants={badgeVariants}
              whileHover={{ scale: 1.05, y: -2 }}
              className="flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-[11px] font-medium text-green-700 sm:px-4 sm:py-2 sm:text-xs"
            >
              <FiCheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Produk Pilihan
            </motion.div>

            <motion.div
              variants={badgeVariants}
              whileHover={{ scale: 1.05, y: -2 }}
              className="flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1.5 text-[11px] font-medium text-yellow-800 sm:px-4 sm:py-2 sm:text-xs"
            >
              <FiTag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Harga Terjangkau
            </motion.div>

            <motion.div
              variants={badgeVariants}
              whileHover={{ scale: 1.05, y: -2 }}
              className="flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-[11px] font-medium text-green-700 sm:px-4 sm:py-2 sm:text-xs"
            >
              <FiPackage className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Beragam Pilihan
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ==========================================
          DAFTAR PRODUK
      ========================================== */}

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-12">
        <AnimatePresence mode="wait">
          {/* Loading */}
          {isLoading && (
            <motion.div
              key="loading"
              variants={stateCardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="py-20 text-center"
            >
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  delay: 0.1,
                }}
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50"
              >
                <div className="h-7 w-7 animate-spin rounded-full border-4 border-green-100 border-t-green-700" />
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mt-4 text-sm font-medium text-gray-500"
              >
                Memuat produk...
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-1 text-xs text-gray-400"
              >
                Mohon tunggu sebentar
              </motion.p>
            </motion.div>
          )}

          {/* Error */}
          {!isLoading && errorMessage && (
            <motion.div
              key="error"
              variants={errorCardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="mx-auto max-w-xl rounded-2xl border border-red-100 bg-white p-7 text-center shadow-sm"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, -5, 5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500"
              >
                <FiAlertCircle className="h-6 w-6" />
              </motion.div>

              <h2 className="mt-4 font-bold text-gray-900">
                Gagal Memuat Produk
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                {errorMessage}
              </p>

              <motion.button
                type="button"
                onClick={() => window.location.reload()}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
              >
                <motion.span
                  whileHover={{ rotate: -180 }}
                  transition={{ duration: 0.4 }}
                >
                  <FiRefreshCw className="h-4 w-4" />
                </motion.span>
                Coba Lagi
              </motion.button>
            </motion.div>
          )}

          {/* Tidak ada produk */}
          {!isLoading &&
            !errorMessage &&
            products.length === 0 && (
              <motion.div
                key="empty"
                variants={stateCardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="py-20 text-center"
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
                  <FiShoppingBag className="h-7 w-7" />
                </motion.div>

                <h2 className="mt-5 text-lg font-bold text-gray-900">
                  Produk Belum Tersedia
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                  Saat ini belum ada produk yang tersedia.
                  Silakan kembali lagi nanti.
                </p>
              </motion.div>
            )}

          {/* Produk tersedia */}
          {!isLoading &&
            !errorMessage &&
            products.length > 0 && (
              <motion.div
                key="products"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* ==========================================
                    SEARCH BAR
                ========================================== */}
                <motion.div
                  variants={searchBarVariants}
                  initial="hidden"
                  animate="visible"
                  className="mb-6"
                >
                  <div className="relative">
                    {/* ICON SEARCH */}
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 sm:pl-5">
                      <FiSearch className="h-5 w-5 text-gray-400" />
                    </div>

                    {/* INPUT */}
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) =>
                        setSearchQuery(e.target.value)
                      }
                      placeholder="Cari produk, kategori, rasa, ukuran..."
                      className="w-full rounded-2xl border border-green-100 bg-white py-4 pl-12 pr-12 text-sm text-gray-800 shadow-sm outline-none transition placeholder:text-gray-400 hover:border-green-200 focus:border-green-600 focus:ring-4 focus:ring-green-50 sm:pl-14 sm:pr-14 sm:text-base"
                    />

                    {/* CLEAR BUTTON */}
                    <AnimatePresence>
                      {searchQuery && (
                        <motion.button
                          type="button"
                          onClick={handleClearSearch}
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          aria-label="Hapus pencarian"
                          className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 transition hover:text-green-700 sm:pr-5"
                        >
                          <FiX className="h-5 w-5" />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* HASIL PENCARIAN INFO */}
                  <AnimatePresence>
                    {searchQuery && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="mt-3 text-sm text-gray-500"
                      >
                        Menampilkan{" "}
                        <span className="font-semibold text-green-700">
                          {filteredProducts.length}
                        </span>{" "}
                        dari {products.length} produk untuk{" "}
                        <span className="font-semibold text-gray-700">
                          &ldquo;{searchQuery}&rdquo;
                        </span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* TITLE */}
                <motion.div
                  variants={gridHeaderVariants}
                  initial="hidden"
                  animate="visible"
                  className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.15em] text-green-700">
                      Katalog
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-gray-900">
                      Pilihan Produk
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Temukan produk yang sesuai dengan kebutuhan Anda.
                    </p>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex w-fit items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-xs font-semibold text-green-700"
                  >
                    <FiPackage className="h-4 w-4" />
                    {filteredProducts.length} produk tersedia
                  </motion.div>
                </motion.div>

                {/* ==========================================
                    HASIL PENCARIAN KOSONG
                ========================================== */}
                <AnimatePresence mode="wait">
                  {filteredProducts.length === 0 ? (
                    <motion.div
                      key="no-results"
                      variants={stateCardVariants}
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
                        Produk Tidak Ditemukan
                      </h3>

                      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                        Tidak ada produk yang cocok dengan{" "}
                        <span className="font-semibold text-gray-700">
                          &ldquo;{searchQuery}&rdquo;
                        </span>
                        . Coba kata kunci lain atau hapus pencarian.
                      </p>

                      <motion.button
                        type="button"
                        onClick={handleClearSearch}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800"
                      >
                        <FiX className="h-4 w-4" />
                        Hapus Pencarian
                      </motion.button>
                    </motion.div>
                  ) : (
                    /* ==========================================
                        GRID PRODUK
                    ========================================== */
                    <motion.div
                      key="grid"
                      variants={gridContainerVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0 }}
                      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    >
                      <AnimatePresence mode="popLayout">
                        {filteredProducts.map((product) => (
                          <motion.div
                            key={product.id}
                            layout
                            variants={productCardVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            whileHover={{ y: -8 }}
                            transition={{
                              type: "spring",
                              stiffness: 200,
                              damping: 20,
                              layout: { duration: 0.3 },
                            }}
                            className="group overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm transition hover:shadow-lg"
                          >
                            {/* GAMBAR */}
                            <div className="relative h-56 overflow-hidden bg-[#eef4e6]">
                              {product.imageUrl ? (
                                <motion.img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  whileHover={{ scale: 1.08 }}
                                  transition={{ duration: 0.5 }}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full flex-col items-center justify-center text-gray-400">
                                  <FiShoppingBag className="h-10 w-10 text-green-200" />

                                  <p className="mt-2 text-xs">
                                    Tidak ada gambar
                                  </p>
                                </div>
                              )}

                              {/* KATEGORI */}
                              {product.category && (
                                <motion.div
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.2 }}
                                  className="absolute left-3 top-3"
                                >
                                  <span className="inline-flex items-center gap-1.5 rounded-full border border-green-100 bg-white/95 px-3 py-1.5 text-xs font-semibold text-green-700 shadow-sm backdrop-blur">
                                    <FiTag className="h-3 w-3" />
                                    {product.category}
                                  </span>
                                </motion.div>
                              )}
                            </div>

                            {/* INFO */}
                            <div className="p-5">
                              <h3 className="line-clamp-1 text-lg font-bold text-gray-900">
                                {product.name}
                              </h3>

                              {product.variant && (
                                <p className="mt-1 line-clamp-1 text-sm text-gray-500">
                                  {product.variant}
                                </p>
                              )}

                              {/* DETAIL SINGKAT */}
                              <div className="mt-4 space-y-2">
                                {product.taste && (
                                  <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2">
                                    <span className="text-xs text-gray-500">
                                      Rasa
                                    </span>

                                    <span className="max-w-[60%] truncate text-xs font-semibold text-green-800">
                                      {product.taste}
                                    </span>
                                  </div>
                                )}

                                {product.size && (
                                  <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                                    <span className="text-xs text-gray-500">
                                      Ukuran
                                    </span>

                                    <span className="max-w-[60%] truncate text-xs font-semibold text-gray-800">
                                      {product.size}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* HARGA */}
                              <div className="mt-5 border-t border-gray-100 pt-4">
                                <p className="text-xs text-gray-400">
                                  Harga mulai dari
                                </p>

                                <p className="mt-1 text-xl font-bold text-green-700">
                                  Rp{" "}
                                  {product.price.toLocaleString("id-ID")}
                                </p>
                              </div>

                              {/* DETAIL */}
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Link
                                  href={`/produk/${product.id}`}
                                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800"
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
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
        </AnimatePresence>
      </section>

      {/* ==========================================
          INFORMASI BAWAH
      ========================================== */}

      <AnimatePresence>
        {!isLoading &&
          !errorMessage &&
          products.length > 0 && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="border-t border-green-100 bg-white"
            >
              <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
                <motion.div
                  variants={infoSectionVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  className="flex flex-col items-center justify-between gap-5 rounded-2xl border border-green-100 bg-green-50/60 p-6 text-center sm:flex-row sm:text-left"
                >
                  <div className="flex items-start gap-4">
                    <motion.div
                      animate={{ rotate: [0, 8, -8, 0] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-400 text-yellow-950"
                    >
                      <FiClock className="h-5 w-5" />
                    </motion.div>

                    <div>
                      <h3 className="font-bold text-gray-900">
                        Bingung menentukan pilihan?
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-gray-600">
                        Gunakan sistem rekomendasi untuk menemukan
                        produk yang sesuai dengan kebutuhan Anda.
                      </p>
                    </div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Link
                      href="/rekomendasi"
                      className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
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
                </motion.div>
              </div>
            </motion.section>
          )}
      </AnimatePresence>
    </main>
  );
}