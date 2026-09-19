"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiEdit2,
  FiImage,
  FiPackage,
  FiSave,
  FiUpload,
} from "react-icons/fi";

import { db } from "@/lib/firebase";
import { uploadToCloudinary } from "@/lib/cloudinary";

const occasionOptions = [
  "Hajatan",
  "Arisan",
  "Acara Keluarga",
  "Pengajian",
  "Oleh-oleh",
  "Acara Lainnya",
];

// ==========================================
// VARIANTS ANIMASI
// ==========================================
const loadingCardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

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
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
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
    marginBottom: 20,
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

const formCardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

const formItemVariants = {
  hidden: { opacity: 0, x: -15 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const occasionContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const occasionItemVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

const currentImageVariants = {
  hidden: { opacity: 0, x: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    x: -20,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

const infoBoxVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.3, ease: "easeOut" as const },
  },
};

export default function EditProdukPage() {
  const params = useParams();
  const router = useRouter();

  const productId = params.id as string;

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [variant, setVariant] = useState("");
  const [taste, setTaste] = useState("");
  const [filling, setFilling] = useState("");
  const [size, setSize] = useState("");
  const [shape, setShape] = useState("");
  const [quantity, setQuantity] = useState("");
  const [occasion, setOccasion] = useState<string[]>([]);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const [oldImageUrl, setOldImageUrl] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /**
   * Mengambil data produk dari Firestore.
   */
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError("");

        const productRef = doc(
          db,
          "products",
          productId
        );

        const productSnapshot = await getDoc(productRef);

        if (!productSnapshot.exists()) {
          setError("Produk tidak ditemukan.");
          return;
        }

        const data = productSnapshot.data();

        setName(data.name || "");
        setCategory(data.category || "");
        setVariant(data.variant || "");
        setTaste(data.taste || "");
        setFilling(data.filling || "");
        setSize(data.size || "");
        setShape(data.shape || "");
        setQuantity(data.quantity || "");

        setPrice(
          data.price !== undefined
            ? String(data.price)
            : ""
        );

        setDescription(data.description || "");
        setOldImageUrl(data.imageUrl || "");

        /**
         * Mengambil data occasion.
         *
         * Jika data lama belum mempunyai occasion,
         * gunakan array kosong agar tetap aman.
         */
        if (Array.isArray(data.occasion)) {
          setOccasion(data.occasion);
        } else if (
          typeof data.occasion === "string"
        ) {
          setOccasion(
            data.occasion
              .split(",")
              .map((item: string) => item.trim())
              .filter(Boolean)
          );
        } else {
          setOccasion([]);
        }
      } catch (err) {
        console.error(err);

        setError(
          "Gagal mengambil data produk."
        );
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  /**
   * Mengatur pilihan acara.
   */
  function handleOccasionChange(value: string) {
    setOccasion((current) => {
      if (current.includes(value)) {
        return current.filter(
          (item) => item !== value
        );
      }

      return [...current, value];
    });
  }

  /**
   * Menyimpan perubahan produk.
   */
  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Nama produk wajib diisi.");
      return;
    }

    if (!category.trim()) {
      setError("Kategori produk wajib diisi.");
      return;
    }

    if (!variant.trim()) {
      setError("Varian produk wajib diisi.");
      return;
    }

    if (!taste.trim()) {
      setError("Rasa produk wajib diisi.");
      return;
    }

    if (!price || Number(price) <= 0) {
      setError(
        "Harga produk harus lebih dari 0."
      );
      return;
    }

    if (occasion.length === 0) {
      setError(
        "Pilih minimal satu acara yang sesuai dengan produk."
      );
      return;
    }

    try {
      setSaving(true);

      let imageUrl = oldImageUrl;

      /**
       * Jika admin memilih gambar baru,
       * upload gambar tersebut ke Cloudinary.
       */
      if (image) {
        imageUrl = await uploadToCloudinary(image);
      }

      /**
       * Update data produk di Firestore.
       */
      const productRef = doc(
        db,
        "products",
        productId
      );

      await updateDoc(productRef, {
        name: name.trim(),
        category: category.trim(),
        variant: variant.trim(),
        taste: taste.trim(),
        filling: filling.trim(),
        size: size.trim(),
        shape: shape.trim(),
        quantity: quantity.trim(),
        occasion,
        price: Number(price),
        description: description.trim(),
        imageUrl,
        updatedAt: serverTimestamp(),
      });

      router.push("/admin/produk");
    } catch (err) {
      console.error(err);

      setError(
        "Gagal memperbarui produk. Silakan coba lagi."
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-green-200 focus:border-green-600 focus:bg-white focus:ring-4 focus:ring-green-50";

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7fbea] px-5">
        <motion.div
          variants={loadingCardVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-sm rounded-2xl border border-green-100 bg-white p-8 text-center shadow-sm"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50"
          >
            <FiPackage className="h-6 w-6 text-green-700" />
          </motion.div>

          <div className="mx-auto mt-5 h-8 w-8 animate-spin rounded-full border-4 border-green-100 border-t-green-700" />

          <h2 className="mt-5 text-sm font-bold text-gray-900">
            Memuat Data Produk
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Silakan tunggu sebentar...
          </p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7fbea]">
      {/* Header */}
      <motion.header
        variants={headerContainerVariants}
        initial="hidden"
        animate="visible"
        className="border-b border-green-100 bg-white"
      >
        <div className="mx-auto max-w-4xl px-5 py-6 sm:px-8">
          <motion.button
            variants={headerItemVariants}
            type="button"
            onClick={() =>
              router.push("/admin/produk")
            }
            whileHover={{ x: -4 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-green-700 transition hover:text-green-800"
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
            Kembali ke Produk
          </motion.button>

          <div className="flex items-center gap-4">
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
                <FiEdit2 className="h-5 w-5" />
              </motion.span>
            </motion.div>

            <motion.div variants={headerItemVariants}>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Edit Produk
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Perbarui informasi produk Roti Sajiyem.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-5 py-6 sm:px-8 lg:py-8">
        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              variants={errorVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex items-start gap-3 overflow-hidden rounded-2xl border border-red-100 bg-red-50 p-4"
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

                <p className="mt-1 text-sm leading-5 text-red-600">
                  {error}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          variants={formCardVariants}
          initial="hidden"
          animate="visible"
          className="overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm"
        >
          {/* Form Header */}
          <motion.div
            variants={formItemVariants}
            className="border-b border-green-100 bg-green-50/50 px-6 py-5 sm:px-8"
          >
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-green-700 shadow-sm"
              >
                <FiPackage className="h-4 w-4" />
              </motion.div>

              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  Informasi Produk
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Perbarui data produk sesuai informasi terbaru.
                </p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-7 p-6 sm:p-8">
            {/* NAMA */}
            <motion.div variants={formItemVariants}>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Nama Produk *
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className={inputClass}
              />
            </motion.div>

            {/* KATEGORI & VARIAN */}
            <motion.div
              variants={formItemVariants}
              className="grid gap-5 md:grid-cols-2"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Kategori *
                </label>

                <input
                  type="text"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Varian *
                </label>

                <input
                  type="text"
                  value={variant}
                  onChange={(e) =>
                    setVariant(e.target.value)
                  }
                  className={inputClass}
                />
              </div>
            </motion.div>

            {/* RASA & ISIAN */}
            <motion.div
              variants={formItemVariants}
              className="grid gap-5 md:grid-cols-2"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Rasa *
                </label>

                <input
                  type="text"
                  value={taste}
                  onChange={(e) =>
                    setTaste(e.target.value)
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Isian
                </label>

                <input
                  type="text"
                  value={filling}
                  onChange={(e) =>
                    setFilling(e.target.value)
                  }
                  className={inputClass}
                />
              </div>
            </motion.div>

            {/* UKURAN & BENTUK */}
            <motion.div
              variants={formItemVariants}
              className="grid gap-5 md:grid-cols-2"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Ukuran
                </label>

                <input
                  type="text"
                  value={size}
                  onChange={(e) =>
                    setSize(e.target.value)
                  }
                  placeholder="Contoh: Kecil, Sedang, Besar"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Bentuk
                </label>

                <input
                  type="text"
                  value={shape}
                  onChange={(e) =>
                    setShape(e.target.value)
                  }
                  className={inputClass}
                />
              </div>
            </motion.div>

            {/* JUMLAH & HARGA */}
            <motion.div
              variants={formItemVariants}
              className="grid gap-5 md:grid-cols-2"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Jumlah
                </label>

                <input
                  type="text"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(e.target.value)
                  }
                  placeholder="Contoh: 1 pcs"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Harga *
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-sm font-bold text-green-700">
                    Rp
                  </span>

                  <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) =>
                      setPrice(e.target.value)
                    }
                    className={`${inputClass} pl-11`}
                  />
                </div>

                <p className="mt-1.5 text-xs text-gray-400">
                  Masukkan angka tanpa titik atau Rp.
                </p>
              </div>
            </motion.div>

            {/* ACARA */}
            <motion.div variants={formItemVariants}>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Cocok Untuk Acara *
              </label>

              <p className="mb-4 text-xs leading-5 text-gray-500">
                Pilih satu atau lebih acara yang sesuai
                dengan produk ini.
              </p>

              <motion.div
                variants={occasionContainerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="grid gap-3 sm:grid-cols-2 md:grid-cols-3"
              >
                {occasionOptions.map((item) => {
                  const checked =
                    occasion.includes(item);

                  return (
                    <motion.label
                      key={item}
                      variants={occasionItemVariants}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className={`group flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition ${
                        checked
                          ? "border-green-600 bg-green-50"
                          : "border-gray-200 bg-white hover:border-green-200 hover:bg-green-50/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          handleOccasionChange(item)
                        }
                        className="h-4 w-4 accent-green-700"
                      />

                      <span
                        className={`text-sm font-medium ${
                          checked
                            ? "text-green-800"
                            : "text-gray-700"
                        }`}
                      >
                        {item}
                      </span>

                      <AnimatePresence>
                        {checked && (
                          <motion.span
                            initial={{
                              scale: 0,
                              opacity: 0,
                              rotate: -90,
                            }}
                            animate={{
                              scale: 1,
                              opacity: 1,
                              rotate: 0,
                            }}
                            exit={{
                              scale: 0,
                              opacity: 0,
                              rotate: 90,
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 20,
                            }}
                            className="ml-auto"
                          >
                            <FiCheckCircle className="h-4 w-4 text-green-600" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.label>
                  );
                })}
              </motion.div>
            </motion.div>

            {/* DESKRIPSI */}
            <motion.div variants={formItemVariants}>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Deskripsi
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                rows={4}
                className={`${inputClass} resize-none`}
              />
            </motion.div>

            {/* GAMBAR */}
            <motion.div variants={formItemVariants}>
              <label className="mb-3 block text-sm font-semibold text-gray-700">
                Gambar Produk
              </label>

              <AnimatePresence>
                {oldImageUrl && (
                  <motion.div
                    variants={currentImageVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="mb-5 overflow-hidden rounded-2xl border border-green-100 bg-green-50/40 p-4"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <motion.span
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <FiImage className="h-4 w-4 text-green-700" />
                      </motion.span>

                      <p className="text-xs font-bold text-green-800">
                        Gambar Saat Ini
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <motion.img
                        src={oldImageUrl}
                        alt={name}
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 0.4 }}
                        className="h-28 w-28 rounded-xl border border-green-100 bg-white object-cover shadow-sm"
                      />

                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {name}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          Pilih gambar baru di bawah jika
                          ingin mengganti gambar produk.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.label
                htmlFor="product-image"
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-7 text-center transition ${
                  image
                    ? "border-green-300 bg-green-50/50"
                    : "border-gray-200 bg-gray-50 hover:border-green-300 hover:bg-green-50/40"
                }`}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={image ? "selected" : "empty"}
                    initial={{ scale: 0.6, opacity: 0, rotate: -20 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.6, opacity: 0, rotate: 20 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-green-700 shadow-sm"
                  >
                    {image ? (
                      <FiCheckCircle className="h-6 w-6" />
                    ) : (
                      <FiUpload className="h-6 w-6" />
                    )}
                  </motion.div>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  <motion.p
                    key={image ? "has-image" : "no-image"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="mt-3 text-sm font-semibold text-gray-800"
                  >
                    {image
                      ? "Gambar baru berhasil dipilih"
                      : "Pilih gambar baru"}
                  </motion.p>
                </AnimatePresence>

                <p className="mt-1 text-xs text-gray-500">
                  Klik untuk memilih file gambar
                </p>

                <AnimatePresence>
                  {image && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.9 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                      className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-green-700 shadow-sm"
                    >
                      <FiImage className="h-3.5 w-3.5 shrink-0" />

                      <span className="truncate">
                        {image.name}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.label>

              <input
                id="product-image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setImage(
                    e.target.files?.[0] || null
                  );
                }}
                className="hidden"
              />
            </motion.div>

            {/* BUTTON */}
            <motion.div
              variants={formItemVariants}
              className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end"
            >
              <motion.button
                type="button"
                onClick={() =>
                  router.push("/admin/produk")
                }
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
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
                Batal
              </motion.button>

              <motion.button
                type="submit"
                disabled={saving}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <motion.span
                      animate={{ y: [0, -2, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <FiSave className="h-4 w-4" />
                    </motion.span>
                    Simpan Perubahan
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>
        </motion.form>

        {/* Information */}
        <motion.div
          variants={infoBoxVariants}
          initial="hidden"
          animate="visible"
          className="mt-5 flex items-start gap-3 rounded-2xl border border-yellow-100 bg-yellow-50/70 p-4"
        >
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-yellow-700 shadow-sm"
          >
            <FiCheckCircle className="h-4 w-4" />
          </motion.div>

          <div>
            <p className="text-xs font-bold text-yellow-800">
              Perubahan Produk
            </p>

            <p className="mt-1 text-xs leading-5 text-yellow-700/80">
              Pastikan informasi produk sudah benar sebelum
              menyimpan perubahan.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}