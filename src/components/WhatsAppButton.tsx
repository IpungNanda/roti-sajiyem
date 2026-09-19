"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";

import {
  FiMessageCircle,
  FiX,
  FiSend,
  FiShoppingBag,
} from "react-icons/fi";

import { db } from "@/lib/firebase";

// ==========================================
// TIPE DATA
// ==========================================
type Product = {
  id: string;
  name: string;
  category: string;
  variant: string;
  taste: string;
  size: string;
  price: number;
  isActive: boolean;
};

// ==========================================
// VARIANTS ANIMASI
// ==========================================
const buttonVariants = {
  hidden: { opacity: 0, scale: 0, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: 1.2,
      type: "spring" as const,
      stiffness: 200,
    },
  },
};

const tooltipVariants = {
  hidden: { opacity: 0, x: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: "easeOut" as const,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
};

const panelVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: "easeOut" as const,
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

const panelItemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

// ==========================================
// KOMPONEN UTAMA
// ==========================================
export default function WhatsAppButton() {
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);

  // ==========================================
  // Cek halaman admin
  // ==========================================
  const isAdminPage = pathname?.startsWith("/admin");

  // ==========================================
  // Ambil nomor WA dari env
  // ==========================================
  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  // ==========================================
  // Tooltip otomatis muncul setelah 2 detik
  // (hanya sekali)
  // ==========================================
  useEffect(() => {
    if (isAdminPage || !whatsappNumber) return;

    const timer = setTimeout(() => {
      setShowTooltip(true);

      // Auto-hide setelah 5 detik
      setTimeout(() => setShowTooltip(false), 5000);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAdminPage, whatsappNumber]);

  // ==========================================
  // Fetch produk aktif dari Firestore
  // ==========================================
  const fetchProducts = async () => {
    if (productsLoaded || isLoadingProducts) return;

    try {
      setIsLoadingProducts(true);

      const productsQuery = query(
        collection(db, "products"),
        where("isActive", "==", true)
      );

      const snapshot = await getDocs(productsQuery);

      const productData: Product[] = snapshot.docs.map(
        (doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            name: data.name || "",
            category: data.category || "",
            variant: data.variant || "",
            taste: data.taste || "",
            size: data.size || "",
            price: Number(data.price || 0),
            isActive: data.isActive ?? true,
          };
        }
      );

      // Urutkan berdasarkan kategori lalu nama
      productData.sort((a, b) => {
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        return a.name.localeCompare(b.name);
      });

      setProducts(productData);
      setProductsLoaded(true);
    } catch (error) {
      console.error("Gagal mengambil produk:", error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // ==========================================
  // Buka panel → fetch produk
  // ==========================================
  const handleOpen = () => {
    setIsOpen(true);
    setShowTooltip(false);

    if (!productsLoaded) {
      fetchProducts();
    }
  };

  // ==========================================
  // Format harga
  // ==========================================
  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // ==========================================
  // Generate pesan auto-chat
  // ==========================================
  const generateMessage = (): string => {
    const header = `Halo *Roti Sajiyem*! 🍞\n\nSaya ingin memesan produk. Berikut daftar produk yang tersedia:\n\n`;

    const productList = products
      .map((product, index) => {
        const detail = [
          product.category && `Kategori: ${product.category}`,
          product.variant && `Varian: ${product.variant}`,
          product.taste && `Rasa: ${product.taste}`,
          product.size && `Ukuran: ${product.size}`,
        ]
          .filter(Boolean)
          .join(" | ");

        return `${index + 1}. *${product.name}*\n   ${detail}\n   Harga: ${formatCurrency(
          product.price
        )}`;
      })
      .join("\n\n");

    const footer = `\n\nMohon informasi ketersediaan dan cara pemesanannya. Terima kasih! 🙏`;

    return header + productList + footer;
  };

  // ==========================================
  // Kirim ke WhatsApp
  // ==========================================
  const handleSendToWhatsApp = () => {
    if (!whatsappNumber) {
      alert("Nomor WhatsApp belum dikonfigurasi.");
      return;
    }

    if (products.length === 0) {
      alert("Produk belum tersedia. Silakan coba lagi.");
      return;
    }

    const message = generateMessage();
    const encodedMessage = encodeURIComponent(message);

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    setIsOpen(false);
  };

  // ==========================================
  // Jangan tampilkan di halaman admin
  // ==========================================
  if (isAdminPage || !whatsappNumber) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 sm:bottom-6 sm:right-6">
      <div className="pointer-events-auto relative flex flex-col items-end gap-3">
        {/* ==========================================
            PANEL PEMESANAN
        ========================================== */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-[calc(100vw-2.5rem)] max-w-sm overflow-hidden rounded-3xl border border-green-100 bg-white shadow-2xl"
            >
              {/* HEADER */}
              <motion.div
                variants={panelItemVariants}
                className="relative overflow-hidden bg-green-800 px-5 py-5 text-white"
              >
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-yellow-400/20 blur-2xl" />
                <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-green-500/20 blur-2xl" />

                <div className="relative flex items-start gap-3">
                  <motion.div
                    animate={{ rotate: [0, 8, -8, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur"
                  >
                    <FiMessageCircle className="h-5 w-5" />
                  </motion.div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold">
                      Pemesanan WhatsApp
                    </h3>

                    <p className="mt-0.5 text-xs leading-5 text-green-100">
                      Pesan otomatis dengan daftar produk & harga
                    </p>
                  </div>

                  <motion.button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Tutup panel"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20"
                  >
                    <FiX className="h-4 w-4" />
                  </motion.button>
                </div>
              </motion.div>

              {/* BODY */}
              <div className="max-h-[60vh] overflow-y-auto px-5 py-5">
                {/* LOADING */}
                {isLoadingProducts && (
                  <motion.div
                    variants={panelItemVariants}
                    className="py-8 text-center"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="mx-auto h-8 w-8 rounded-full border-4 border-green-100 border-t-green-700"
                    />

                    <p className="mt-3 text-xs text-gray-500">
                      Memuat daftar produk...
                    </p>
                  </motion.div>
                )}

                {/* EMPTY */}
                {!isLoadingProducts && products.length === 0 && (
                  <motion.div
                    variants={panelItemVariants}
                    className="py-8 text-center"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50 text-yellow-700">
                      <FiShoppingBag className="h-5 w-5" />
                    </div>

                    <p className="mt-3 text-sm font-semibold text-gray-900">
                      Produk Belum Tersedia
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Saat ini belum ada produk aktif untuk
                      dipesan.
                    </p>
                  </motion.div>
                )}

                {/* LIST PRODUK */}
                {!isLoadingProducts && products.length > 0 && (
                  <>
                    <motion.p
                      variants={panelItemVariants}
                      className="mb-3 text-xs font-bold uppercase tracking-wider text-green-700"
                    >
                      Preview Pesan
                    </motion.p>

                    <motion.div
                      variants={panelItemVariants}
                      className="rounded-2xl border border-green-100 bg-green-50/40 p-3"
                    >
                      <div className="rounded-xl bg-white p-3 shadow-sm">
                        <p className="text-xs font-bold text-green-800">
                          Halo Roti Sajiyem! 🍞
                        </p>

                        <p className="mt-2 text-[11px] leading-5 text-gray-600">
                          Saya ingin memesan produk. Berikut
                          daftar produk yang tersedia:
                        </p>

                        <div className="mt-3 space-y-2.5">
                          {products.map((product, index) => (
                            <div
                              key={product.id}
                              className="border-l-2 border-green-200 pl-2.5"
                            >
                              <p className="text-[11px] font-bold text-gray-900">
                                {index + 1}. {product.name}
                              </p>

                              <p className="mt-0.5 text-[10px] text-gray-500">
                                {[
                                  product.category,
                                  product.variant,
                                  product.taste,
                                  product.size,
                                ]
                                  .filter(Boolean)
                                  .join(" • ")}
                              </p>

                              <p className="mt-0.5 text-[11px] font-semibold text-green-700">
                                {formatCurrency(product.price)}
                              </p>
                            </div>
                          ))}
                        </div>

                        <p className="mt-3 text-[11px] leading-5 text-gray-600">
                          Mohon informasi ketersediaan dan cara
                          pemesanannya. Terima kasih! 🙏
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      variants={panelItemVariants}
                      className="mt-4 flex items-center gap-2 rounded-xl bg-yellow-50 px-3 py-2.5"
                    >
                      <FiShoppingBag className="h-3.5 w-3.5 shrink-0 text-yellow-700" />

                      <p className="text-[11px] leading-4 text-yellow-800">
                        {products.length} produk akan otomatis
                        dimasukkan ke chat WhatsApp
                      </p>
                    </motion.div>
                  </>
                )}

                {/* BUTTON */}
                <motion.button
                  variants={panelItemVariants}
                  type="button"
                  onClick={handleSendToWhatsApp}
                  disabled={
                    isLoadingProducts ||
                    products.length === 0
                  }
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <motion.span
                    animate={{ x: [0, 3, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <FiSend className="h-4 w-4" />
                  </motion.span>
                  Kirim ke WhatsApp
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==========================================
            TOOLTIP
        ========================================== */}
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              variants={tooltipVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="max-w-[220px] rounded-2xl border border-green-100 bg-white px-4 py-3 shadow-xl"
            >
              <p className="text-xs font-bold text-gray-900">
                Butuh bantuan memesan?
              </p>

              <p className="mt-1 text-[11px] leading-4 text-gray-500">
                Klik tombol ini untuk memesan via WhatsApp
                dengan daftar produk otomatis.
              </p>

              <div className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 border-b border-r border-green-100 bg-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==========================================
            FLOATING BUTTON
        ========================================== */}
        <motion.button
          variants={buttonVariants}
          initial="hidden"
          animate="visible"
          type="button"
          onClick={() => (isOpen ? setIsOpen(false) : handleOpen())}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          aria-label="Pemesanan WhatsApp"
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-xl transition hover:bg-green-700 hover:shadow-2xl sm:h-16 sm:w-16"
        >
          {/* Pulse ring */}
          <motion.span
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-full bg-green-500"
          />

          {/* Icon */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isOpen ? "close" : "chat"}
              initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
              transition={{ duration: 0.25 }}
              className="relative"
            >
              {isOpen ? (
                <FiX className="h-6 w-6 sm:h-7 sm:w-7" />
              ) : (
                <FiMessageCircle className="h-6 w-6 sm:h-7 sm:w-7" />
              )}
            </motion.span>
          </AnimatePresence>

          {/* Notification dot */}
          {!isOpen && !productsLoaded && (
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-yellow-400"
            />
          )}
        </motion.button>
      </div>
    </div>
  );
}