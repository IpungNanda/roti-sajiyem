
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import {
  FiArrowLeft,
  FiPackage,
  FiSave,
  FiUpload,
} from "react-icons/fi";

import { db } from "@/lib/firebase";
import { uploadToCloudinary } from "@/lib/cloudinary";

const categories = [
  "Bolu Gulung",
  "Mandarin",
  "Prol",
  "Krumpul",
  "Bolu Belah",
  "Bolu Selai",
  "Roti Kacang",
];

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:bg-white focus:ring-4 focus:ring-green-50";

export default function TambahProdukPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [taste, setTaste] = useState("Manis");
  const [size, setSize] = useState("Kecil");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Nama produk wajib diisi.");
      return;
    }

    if (!category) {
      setError("Kategori produk wajib dipilih.");
      return;
    }

    if (!taste || !size) {
      setError("Rasa dan ukuran produk wajib dipilih.");
      return;
    }

    if (!price || !Number.isFinite(Number(price)) || Number(price) <= 0) {
      setError("Harga harus berupa angka lebih dari 0.");
      return;
    }

    if (!image) {
      setError("Gambar produk wajib dipilih.");
      return;
    }

    try {
      setLoading(true);

      // Unggah gambar ke Cloudinary.
      const imageUrl = await uploadToCloudinary(image);

      // Simpan data produk ke Firestore.
      await addDoc(collection(db, "products"), {
        name: name.trim(),
        category,
        taste,
        size,
        price: Number(price),
        description: description.trim(),
        imageUrl,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      router.push("/admin/produk");
    } catch (err) {
      console.error("Gagal menambahkan produk:", err);
      setError("Gagal menambahkan produk. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7fbea]">
      <header className="border-b border-green-100 bg-white">
        <div className="mx-auto max-w-4xl px-5 py-6 sm:px-8">
          <button
            type="button"
            onClick={() => router.push("/admin/produk")}
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800"
          >
            <FiArrowLeft />
            Kembali ke Produk
          </button>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-700 text-white">
              <FiPackage className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tambah Produk
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Lengkapi informasi produk Roti Sajiyem.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm"
        >
          <div className="border-b border-green-100 bg-green-50/50 px-6 py-5">
            <h2 className="font-bold text-gray-900">
              Informasi Produk
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Kolom bertanda * wajib diisi.
            </p>
          </div>

          <div className="space-y-6 p-6 sm:p-8">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Nama Produk *
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Gulung Ori"
                className={inputClass}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Kategori *
                </label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Pilih kategori</option>
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Rasa *
                </label>
                <select
                  required
                  value={taste}
                  onChange={(e) => setTaste(e.target.value)}
                  className={inputClass}
                >
                  <option value="Manis">Manis</option>
                  <option value="Gurih">Gurih</option>
                </select>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Ukuran *
                </label>
                <select
                  required
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className={inputClass}
                >
                  <option value="Kecil">Kecil</option>
                  <option value="Besar">Besar</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Harga (Rp) *
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  step="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Contoh: 26000"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Deskripsi
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi tambahan produk (opsional)"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Gambar Produk *
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-green-300 bg-green-50/50 p-4 hover:bg-green-50">
                <FiUpload className="h-5 w-5 text-green-700" />
                <span className="text-sm text-gray-700">
                  {image ? image.name : "Pilih gambar produk"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  required
                  className="hidden"
                  onChange={(e) =>
                    setImage(e.target.files?.[0] ?? null)
                  }
                />
              </label>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={loading}
                onClick={() => router.push("/admin/produk")}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiSave />
                {loading ? "Menyimpan..." : "Simpan Produk"}
              </button>
            </div>
          </div>
        </motion.form>
      </div>
    </main>
  );
}
