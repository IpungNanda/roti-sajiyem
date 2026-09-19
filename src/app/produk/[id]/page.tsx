"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";

import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiMaximize,
  FiPackage,
  FiShoppingBag,
  FiTag,
  FiMessageCircle,
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
const pageFadeVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const loadingCardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
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
};

const headerVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const imageSectionVariants = {
  hidden: { opacity: 0, scale: 0.95, x: -30 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut" as const,
      delay: 0.1,
    },
  },
};

const infoSectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
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

const tableContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const tableRowVariants = {
  hidden: { opacity: 0, x: -15 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

const extraCardContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const extraCardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function DetailProdukPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // ==========================================
  // Mengambil data produk dari Firestore
  // ==========================================
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        if (!id) {
          throw new Error("ID produk tidak ditemukan.");
        }

        const productRef = doc(db, "products", id);
        const productSnap = await getDoc(productRef);

        if (!productSnap.exists()) {
          throw new Error("Produk tidak ditemukan.");
        }

        const data = productSnap.data();

        if (data.isActive === false) {
          throw new Error("Produk ini sedang tidak tersedia.");
        }

        const productData: Product = {
          id: productSnap.id,
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

        setProduct(productData);
      } catch (error) {
        console.error("Gagal mengambil detail produk:", error);

        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Gagal mengambil detail produk.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // ==========================================
  // Tombol WhatsApp
  // ==========================================
  const handleWhatsApp = () => {
    if (!product) {
      return;
    }

    const whatsappNumber =
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

    if (!whatsappNumber) {
      alert("Nomor WhatsApp belum dikonfigurasi.");
      return;
    }

    const message = `Halo Roti Sajiyem, saya ingin memesan produk:

Nama Produk: ${product.name}
Varian: ${product.variant}
Rasa: ${product.taste}
Harga: Rp ${product.price.toLocaleString("id-ID")}

Apakah produk tersebut masih tersedia?`;

    const encodedMessage = encodeURIComponent(message);

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ==========================================
  // Loading
  // ==========================================
  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7fbea] px-5">
        <motion.div
          variants={loadingCardVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              delay: 0.1,
            }}
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50"
          >
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-100 border-t-green-700" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-sm font-medium text-gray-600"
          >
            Memuat detail produk...
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
      </main>
    );
  }

  // ==========================================
  // Error / Produk tidak ditemukan
  // ==========================================
  if (errorMessage || !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7fbea] px-5">
        <motion.div
          variants={errorCardVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md rounded-3xl border border-green-100 bg-white p-8 text-center shadow-sm"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, -5, 5, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500"
          >
            <FiAlertCircle className="h-7 w-7" />
          </motion.div>

          <h1 className="text-xl font-bold text-gray-900">
            Produk Tidak Ditemukan
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            {errorMessage ||
              "Produk yang Anda cari tidak tersedia."}
          </p>

          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="mt-6 inline-block"
          >
            <Link
              href="/produk"
              className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
            >
              <motion.span
                animate={{ x: [0, -4, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <FiArrowLeft className="h-4 w-4" />
              </motion.span>
              Kembali ke Produk
            </Link>
          </motion.div>
        </motion.div>
      </main>
    );
  }

  return (
    <motion.main
      variants={pageFadeVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-[#f7fbea]"
    >
      {/* ==========================================
          Header Detail
      ========================================== */}
      <section className="border-b border-green-100 bg-white">
        <motion.div
          variants={headerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-7xl px-5 py-5 sm:px-8"
        >
          <motion.div
            whileHover={{ x: -4 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="inline-block"
          >
            <Link
              href="/produk"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-green-700"
            >
              <FiArrowLeft className="h-4 w-4" />
              Kembali ke Produk
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ==========================================
          Detail Produk
      ========================================== */}
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-12">
        <div className="overflow-hidden rounded-[2rem] border border-green-100 bg-white shadow-sm">
          <div className="grid lg:grid-cols-2">
            {/* ======================================
                Gambar Produk
            ====================================== */}
            <motion.div
              variants={imageSectionVariants}
              initial="hidden"
              animate="visible"
              className="relative bg-gradient-to-br from-green-50 via-white to-yellow-50"
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute left-6 top-6 z-10"
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(34,197,94,0)",
                      "0 0 0 8px rgba(34,197,94,0.1)",
                      "0 0 0 0 rgba(34,197,94,0)",
                    ],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="flex items-center gap-2 rounded-full border border-green-200 bg-white/95 px-4 py-2 text-xs font-bold text-green-700 shadow-sm backdrop-blur"
                >
                  <FiCheckCircle className="h-4 w-4" />
                  Produk Tersedia
                </motion.div>
              </motion.div>

              <div className="flex min-h-[380px] items-center justify-center p-6 sm:min-h-[500px] lg:min-h-[620px]">
                {product.imageUrl ? (
                  <div className="relative flex h-full w-full items-center justify-center">
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 0.7, 0.5],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute h-64 w-64 rounded-full bg-green-100/60 blur-3xl sm:h-80 sm:w-80"
                    />

                    <motion.img
                      src={product.imageUrl}
                      alt={product.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.6,
                        delay: 0.3,
                        ease: "easeOut",
                      }}
                      whileHover={{ scale: 1.04, y: -6 }}
                      className="relative max-h-[520px] w-full rounded-2xl object-contain drop-shadow-xl"
                    />
                  </div>
                ) : (
                  <div className="text-center">
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-green-100 text-green-700"
                    >
                      <FiShoppingBag className="h-9 w-9" />
                    </motion.div>

                    <p className="mt-4 text-sm font-medium text-gray-500">
                      Gambar produk belum tersedia
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* ======================================
                Informasi Produk
            ====================================== */}
            <motion.div
              variants={infoSectionVariants}
              initial="hidden"
              animate="visible"
              className="p-6 sm:p-8 lg:p-10"
            >
              {/* Kategori */}
              {product.category && (
                <motion.div
                  variants={infoItemVariants}
                  className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-xs font-bold text-green-700"
                >
                  <motion.span
                    whileHover={{ rotate: 15 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <FiTag className="h-3.5 w-3.5" />
                  </motion.span>
                  {product.category}
                </motion.div>
              )}

              {/* Nama */}
              <motion.h1
                variants={infoItemVariants}
                className="mt-5 text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl"
              >
                {product.name}
              </motion.h1>

              {/* Varian */}
              {product.variant && (
                <motion.p
                  variants={infoItemVariants}
                  className="mt-2 text-base text-gray-500"
                >
                  {product.variant}
                </motion.p>
              )}

              {/* Harga */}
              <motion.div
                variants={infoItemVariants}
                whileHover={{ scale: 1.01 }}
                className="mt-7 rounded-2xl border border-yellow-100 bg-[#fffdf2] p-5"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <motion.span
                    animate={{ y: [0, -3, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <FiDollarSign className="h-4 w-4 text-yellow-600" />
                  </motion.span>
                  Harga Produk
                </div>

                <p className="mt-2 text-3xl font-bold text-green-700 sm:text-4xl">
                  Rp {product.price.toLocaleString("id-ID")}
                </p>
              </motion.div>

              {/* ====================================
                  Informasi Produk
              ==================================== */}
              <motion.div
                variants={infoItemVariants}
                className="mt-8"
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-700"
                  >
                    <FiPackage className="h-4 w-4" />
                  </motion.div>

                  <h2 className="text-lg font-bold text-gray-900">
                    Informasi Produk
                  </h2>
                </div>

                <motion.div
                  variants={tableContainerVariants}
                  className="mt-4 overflow-hidden rounded-2xl border border-gray-100"
                >
                  {/* Rasa */}
                  {product.taste && (
                    <motion.div
                      variants={tableRowVariants}
                      className="flex items-center justify-between gap-5 border-b border-gray-100 px-4 py-4 transition hover:bg-green-50/50"
                    >
                      <span className="text-sm text-gray-500">
                        Rasa
                      </span>

                      <span className="text-right text-sm font-semibold text-gray-900">
                        {product.taste}
                      </span>
                    </motion.div>
                  )}

                  {/* Isian */}
                  {product.filling && (
                    <motion.div
                      variants={tableRowVariants}
                      className="flex items-center justify-between gap-5 border-b border-gray-100 px-4 py-4 transition hover:bg-green-50/50"
                    >
                      <span className="text-sm text-gray-500">
                        Isian / Bahan
                      </span>

                      <span className="max-w-[60%] text-right text-sm font-semibold text-gray-900">
                        {product.filling}
                      </span>
                    </motion.div>
                  )}

                  {/* Ukuran */}
                  {product.size && (
                    <motion.div
                      variants={tableRowVariants}
                      className="flex items-center justify-between gap-5 border-b border-gray-100 px-4 py-4 transition hover:bg-green-50/50"
                    >
                      <span className="flex items-center gap-2 text-sm text-gray-500">
                        <FiMaximize className="h-4 w-4" />
                        Ukuran
                      </span>

                      <span className="text-right text-sm font-semibold text-gray-900">
                        {product.size}
                      </span>
                    </motion.div>
                  )}

                  {/* Bentuk */}
                  {product.shape && (
                    <motion.div
                      variants={tableRowVariants}
                      className="flex items-center justify-between gap-5 border-b border-gray-100 px-4 py-4 transition hover:bg-green-50/50"
                    >
                      <span className="text-sm text-gray-500">
                        Bentuk
                      </span>

                      <span className="text-right text-sm font-semibold text-gray-900">
                        {product.shape}
                      </span>
                    </motion.div>
                  )}

                  {/* Jumlah */}
                  {product.quantity && (
                    <motion.div
                      variants={tableRowVariants}
                      className="flex items-center justify-between gap-5 px-4 py-4 transition hover:bg-green-50/50"
                    >
                      <span className="text-sm text-gray-500">
                        Isi / Jumlah
                      </span>

                      <span className="text-right text-sm font-semibold text-gray-900">
                        {product.quantity}
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>

              {/* ====================================
                  Deskripsi
              ==================================== */}
              {product.description && (
                <motion.div
                  variants={infoItemVariants}
                  className="mt-8"
                >
                  <h2 className="text-lg font-bold text-gray-900">
                    Deskripsi
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-gray-600">
                    {product.description}
                  </p>
                </motion.div>
              )}

              {/* ====================================
                  Tombol WhatsApp
              ==================================== */}
              <motion.button
                variants={infoItemVariants}
                type="button"
                onClick={handleWhatsApp}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-green-700 px-6 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-green-800 hover:shadow-md"
              >
                <motion.span
                  animate={{ rotate: [0, 12, -12, 0] }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <FiMessageCircle className="h-5 w-5" />
                </motion.span>
                Pesan via WhatsApp
              </motion.button>

              <motion.div
                variants={infoItemVariants}
                className="mt-4 flex items-start gap-3 rounded-xl bg-green-50 px-4 py-3"
              >
                <FiClock className="mt-0.5 h-4 w-4 shrink-0 text-green-700" />

                <p className="text-xs leading-5 text-green-800">
                  Anda akan diarahkan ke WhatsApp untuk melakukan
                  pemesanan dan konfirmasi ketersediaan produk.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* ==========================================
            Informasi Tambahan
        ========================================== */}
        <motion.div
          variants={extraCardContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-6 grid gap-4 sm:grid-cols-2"
        >
          <motion.div
            variants={extraCardVariants}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700"
              >
                <FiCheckCircle className="h-5 w-5" />
              </motion.div>

              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Informasi Produk Jelas
                </h3>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Lihat detail produk, varian, ukuran, rasa, dan harga
                  sebelum melakukan pemesanan.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={extraCardVariants}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="rounded-2xl border border-yellow-100 bg-[#fffdf2] p-5 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-100 text-yellow-700"
              >
                <FiMessageCircle className="h-5 w-5" />
              </motion.div>

              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Pemesanan Mudah
                </h3>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Hubungi Roti Sajiyem secara langsung melalui WhatsApp
                  untuk melakukan pemesanan.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </motion.main>
  );
}