"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiEdit2,
  FiPackage,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
} from "react-icons/fi";

import { db } from "@/lib/firebase";

type Product = {
  id: string;
  name: string;
  category: string;
  variant: string;
  taste: string;
  price: number;
  isActive: boolean;
};

// ==========================================
// VARIANTS ANIMASI
// ==========================================
const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const headerItemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const headerLogoVariants = {
  hidden: { opacity: 0, scale: 0.7, rotate: -15 },
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

const summaryContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const summaryCardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const tableWrapperVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.3, ease: "easeOut" as const },
  },
};

const tableHeaderVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, delay: 0.4, ease: "easeOut" as const },
  },
};

const errorVariants = {
  hidden: {
    opacity: 0,
    height: 0,
    marginTop: 0,
    x: 0,
  },
  visible: {
    opacity: 1,
    height: "auto",
    marginTop: 20,
    x: [0, -8, 8, -6, 6, -3, 3, 0],
    transition: {
      duration: 0.5,
      x: { duration: 0.5, ease: "easeInOut" },
      opacity: { duration: 0.3 },
      height: { duration: 0.3 },
      marginTop: { duration: 0.3 },
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    marginTop: 0,
    transition: { duration: 0.2 },
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

const tbodyVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -15 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    x: 30,
    height: 0,
    transition: { duration: 0.25, ease: "easeIn" as const },
  },
};

const bottomInfoVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: 0.2, ease: "easeOut" as const },
  },
};

export default function ProdukAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState("");

  // ==========================================
  // Mengambil produk dari Firestore
  // ==========================================
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const productsRef = collection(db, "products");

      const productsQuery = query(
        productsRef,
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(productsQuery);

      const productData: Product[] = snapshot.docs.map(
        (product) => {
          const data = product.data();

          return {
            id: product.id,
            name: data.name || "",
            category: data.category || "",
            variant: data.variant || "",
            taste: data.taste || "",
            price: Number(data.price || 0),
            isActive: data.isActive ?? true,
          };
        }
      );

      setProducts(productData);
    } catch (error) {
      console.error(
        "Gagal mengambil produk:",
        error
      );

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Gagal mengambil data produk."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // Jalankan saat halaman dibuka
  // ==========================================
  useEffect(() => {
    fetchProducts();
  }, []);

  // ==========================================
  // Hapus Produk
  // ==========================================
  const handleDelete = async (
    id: string,
    name: string
  ) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus produk "${name}"?\n\nData produk yang dihapus tidak dapat dikembalikan.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setErrorMessage("");

      // Hapus dokumen dari Firestore
      await deleteDoc(
        doc(db, "products", id)
      );

      // Hapus produk dari tampilan tanpa reload
      setProducts((currentProducts) =>
        currentProducts.filter(
          (product) => product.id !== id
        )
      );

      alert(
        `Produk "${name}" berhasil dihapus.`
      );
    } catch (error) {
      console.error(
        "Gagal menghapus produk:",
        error
      );

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Gagal menghapus produk."
        );
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7fbea]">
      {/* Header */}
      <motion.header
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="border-b border-green-100 bg-white"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <motion.div variants={headerItemVariants}>
            <div className="flex items-center gap-3">
              <motion.div
                variants={headerLogoVariants}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-700 text-white shadow-sm"
              >
                <motion.span
                  animate={{ rotate: [0, 8, -8, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <FiPackage className="h-5 w-5" />
                </motion.span>
              </motion.div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  Produk
                </h1>

                <p className="mt-0.5 text-sm text-gray-500">
                  Kelola produk Roti Sajiyem
                </p>
              </div>
            </div>
          </motion.div>

          {/* Tombol Header */}
          <motion.div
            variants={headerItemVariants}
            className="flex flex-col gap-2.5 sm:flex-row"
          >
            {/* Beranda Admin */}
            <motion.div
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                href="/admin"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-100 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
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
                Beranda Admin
              </Link>
            </motion.div>

            {/* Tambah Produk */}
            <motion.div
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                href="/admin/produk/tambah"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 hover:shadow-md"
              >
                <motion.span
                  animate={{ rotate: [0, 90, 0] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <FiPlus className="h-4 w-4" />
                </motion.span>
                Tambah Produk
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:py-8">
        {/* Summary */}
        <motion.div
          variants={summaryContainerVariants}
          initial="hidden"
          animate="visible"
          className="mb-6 grid gap-4 sm:grid-cols-3"
        >
          <motion.div
            variants={summaryCardVariants}
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
                  {isLoading ? "-" : products.length}
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
          </motion.div>

          <motion.div
            variants={summaryCardVariants}
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
                  {isLoading
                    ? "-"
                    : products.filter(
                        (product) =>
                          product.isActive
                      ).length}
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
          </motion.div>

          <motion.div
            variants={summaryCardVariants}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="rounded-2xl border border-yellow-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Produk Tidak Aktif
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {isLoading
                    ? "-"
                    : products.filter(
                        (product) =>
                          !product.isActive
                      ).length}
                </p>
              </div>

              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-50 text-yellow-700"
              >
                <FiAlertCircle className="h-5 w-5" />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          variants={tableWrapperVariants}
          initial="hidden"
          animate="visible"
          className="overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm"
        >
          {/* Table Header */}
          <motion.div
            variants={tableHeaderVariants}
            className="flex flex-col gap-4 border-b border-green-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
          >
            <div>
              <h2 className="font-bold text-gray-900">
                Daftar Produk
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Produk yang tersedia di Roti Sajiyem
              </p>
            </div>

            <motion.button
              type="button"
              onClick={fetchProducts}
              disabled={isLoading}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-4 py-2.5 text-xs font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiRefreshCw
                className={`h-4 w-4 ${
                  isLoading
                    ? "animate-spin"
                    : ""
                }`}
              />
              Refresh Data
            </motion.button>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                variants={errorVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mx-5 flex items-start gap-3 overflow-hidden rounded-xl border border-red-100 bg-red-50 px-4 py-3 sm:mx-6"
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
                  <p className="text-sm font-semibold text-red-700">
                    Terjadi Kesalahan
                  </p>

                  <p className="mt-1 text-sm leading-5 text-red-600">
                    {errorMessage}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {/* Loading */}
            {isLoading ? (
              <motion.div
                key="loading"
                variants={stateCardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="px-6 py-20 text-center"
              >
                <motion.div
                  initial={{ scale: 0.6, opacity: 0, rotate: -20 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    delay: 0.1,
                  }}
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50"
                >
                  <FiRefreshCw className="h-6 w-6 animate-spin text-green-700" />
                </motion.div>

                <h3 className="mt-5 text-sm font-bold text-gray-900">
                  Memuat Produk
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Sedang mengambil data produk...
                </p>
              </motion.div>
            ) : products.length === 0 ? (
              /* Empty State */
              <motion.div
                key="empty"
                variants={stateCardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="px-6 py-20 text-center"
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
                  <FiPackage className="h-7 w-7" />
                </motion.div>

                <h3 className="mt-5 font-bold text-gray-900">
                  Belum Ada Produk
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                  Tambahkan produk Roti Sajiyem
                  terlebih dahulu agar dapat
                  dikelola melalui halaman ini.
                </p>

                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="mt-6 inline-block"
                >
                  <Link
                    href="/admin/produk/tambah"
                    className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800"
                  >
                    <motion.span
                      animate={{ rotate: [0, 90, 0] }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <FiPlus className="h-4 w-4" />
                    </motion.span>
                    Tambah Produk
                  </Link>
                </motion.div>
              </motion.div>
            ) : (
              /* Table */
              <motion.div
                key="table"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-x-auto"
              >
                <table className="w-full min-w-[950px] text-left">
                  <thead className="bg-green-50/70 text-xs uppercase tracking-wider text-green-800">
                    <tr>
                      <th className="px-6 py-4 font-bold">
                        No
                      </th>

                      <th className="px-6 py-4 font-bold">
                        Nama Produk
                      </th>

                      <th className="px-6 py-4 font-bold">
                        Kategori
                      </th>

                      <th className="px-6 py-4 font-bold">
                        Varian
                      </th>

                      <th className="px-6 py-4 font-bold">
                        Rasa
                      </th>

                      <th className="px-6 py-4 font-bold">
                        Harga
                      </th>

                      <th className="px-6 py-4 font-bold">
                        Status
                      </th>

                      <th className="px-6 py-4 text-center font-bold">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <motion.tbody
                    variants={tbodyVariants}
                    initial="hidden"
                    animate="visible"
                    className="divide-y divide-gray-100"
                  >
                    <AnimatePresence>
                      {products.map(
                        (product, index) => (
                          <motion.tr
                            key={product.id}
                            variants={rowVariants}
                            exit="exit"
                            layout
                            className="group transition hover:bg-green-50/40"
                          >
                            {/* No */}
                            <td className="px-6 py-4">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-xs font-bold text-gray-500 group-hover:bg-white">
                                {index + 1}
                              </div>
                            </td>

                            {/* Nama */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <motion.div
                                  whileHover={{
                                    rotate: 10,
                                    scale: 1.1,
                                  }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 300,
                                  }}
                                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700"
                                >
                                  <FiPackage className="h-4 w-4" />
                                </motion.div>

                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {product.name}
                                  </p>

                                  <p className="mt-0.5 text-xs text-gray-400">
                                    ID: {product.id.slice(0, 8)}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Kategori */}
                            <td className="px-6 py-4">
                              <span className="inline-flex rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600">
                                {product.category}
                              </span>
                            </td>

                            {/* Varian */}
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {product.variant || "-"}
                            </td>

                            {/* Rasa */}
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {product.taste || "-"}
                            </td>

                            {/* Harga */}
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-green-700">
                                Rp{" "}
                                {product.price.toLocaleString(
                                  "id-ID"
                                )}
                              </p>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4">
                              {product.isActive ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
                                  <FiCheckCircle className="h-3.5 w-3.5" />
                                  Aktif
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600">
                                  <FiAlertCircle className="h-3.5 w-3.5" />
                                  Tidak Aktif
                                </span>
                              )}
                            </td>

                            {/* Aksi */}
                            <td className="px-6 py-4">
                              <div className="flex justify-center gap-2">
                                {/* Edit */}
                                <motion.div
                                  whileHover={{ scale: 1.1, y: -2 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Link
                                    href={`/admin/produk/${product.id}/edit`}
                                    title="Edit produk"
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-green-100 bg-white text-green-700 transition hover:border-green-200 hover:bg-green-50"
                                  >
                                    <motion.span
                                      whileHover={{ rotate: 15 }}
                                      transition={{
                                        type: "spring",
                                        stiffness: 300,
                                      }}
                                    >
                                      <FiEdit2 className="h-4 w-4" />
                                    </motion.span>
                                  </Link>
                                </motion.div>

                                {/* Hapus */}
                                <motion.button
                                  type="button"
                                  disabled={
                                    deletingId ===
                                    product.id
                                  }
                                  onClick={() =>
                                    handleDelete(
                                      product.id,
                                      product.name
                                    )
                                  }
                                  title="Hapus produk"
                                  whileHover={{ scale: 1.1, y: -2 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-white text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {deletingId ===
                                  product.id ? (
                                    <FiRefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <motion.span
                                      whileHover={{
                                        rotate: [0, -15, 15, 0],
                                      }}
                                      transition={{
                                        duration: 0.4,
                                      }}
                                    >
                                      <FiTrash2 className="h-4 w-4" />
                                    </motion.span>
                                  )}
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        )
                      )}
                    </AnimatePresence>
                  </motion.tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Bottom Information */}
        <AnimatePresence>
          {!isLoading && products.length > 0 && (
            <motion.div
              variants={bottomInfoVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              className="mt-5 flex flex-col gap-2 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between"
            >
              <p>
                Menampilkan{" "}
                <span className="font-semibold text-gray-600">
                  {products.length}
                </span>{" "}
                produk
              </p>

              <div className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <FiCheckCircle className="h-3.5 w-3.5 text-green-600" />
                </motion.span>
                <span>
                  Data tersimpan di Firestore
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}