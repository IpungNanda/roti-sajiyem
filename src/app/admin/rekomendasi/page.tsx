"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiBarChart2,
  FiCheckCircle,
  FiCpu,
  FiFilter,
  FiImage,
  FiPackage,
  FiSearch,
  FiSliders,
  FiStar,
  FiTag,
} from "react-icons/fi";

import { db } from "@/lib/firebase";
import {
  getRecommendations,
  type RecommendationResult,
} from "@/lib/recommendation/recommend";
import type { Product } from "@/types/product";

type PriceOption = {
  label: string;
  minPrice?: number;
  maxPrice?: number;
};

const categoryOptions = [
  "Bolu Gulung",
  "Mandarin",
  "Prol",
  "Krumpul",
  "Bolu Belah",
  "Bolu Selai",
  "Roti Kacang",
];

const priceOptions: PriceOption[] = [
  { label: "Semua Harga" },
  { label: "Rp12.000–Rp25.000", minPrice: 12000, maxPrice: 25000 },
  { label: "Rp26.000–Rp50.000", minPrice: 26000, maxPrice: 50000 },
  { label: "Rp51.000–Rp100.000", minPrice: 51000, maxPrice: 100000 },
  { label: "Rp101.000–Rp130.000", minPrice: 101000, maxPrice: 130000 },
  { label: "Di atas Rp130.000", minPrice: 130001 },
];

const sizeOptions = ["Semua Ukuran", "Kecil", "Besar"];
const tasteOptions = ["Semua Rasa", "Manis", "Gurih"];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/**
 * Normalisasi menjaga halaman tetap dapat membaca dokumen produk lama.
 * Field inti rekomendasi: name, category, taste, size, price.
 */
function normalizeProduct(id: string, data: Record<string, unknown>): Product {
  const occasionValue = data.occasion;
  const occasion = Array.isArray(occasionValue)
    ? occasionValue.filter((item): item is string => typeof item === "string")
    : typeof occasionValue === "string"
      ? occasionValue.split(",").map((item) => item.trim()).filter(Boolean)
      : [];

  return {
    id,
    name: asString(data.name),
    category: asString(data.category),
    variant: asString(data.variant),
    taste: asString(data.taste),
    filling: asString(data.filling),
    size: asString(data.size),
    shape: asString(data.shape),
    quantity: asString(data.quantity),
    occasion,
    price: Number(data.price) || 0,
    description: asString(data.description),
    imageUrl: asString(data.imageUrl),
    isActive: typeof data.isActive === "boolean" ? data.isActive : true,
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}

export default function AdminRekomendasiPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTaste, setSelectedTaste] = useState("Semua Rasa");
  const [selectedSize, setSelectedSize] = useState("Semua Ukuran");
  const [selectedPrice, setSelectedPrice] = useState("Semua Harga");
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");
        const snapshot = await getDocs(collection(db, "products"));
        const loaded = snapshot.docs.map((item) =>
          normalizeProduct(item.id, item.data() as Record<string, unknown>)
        );
        if (!cancelled) setProducts(loaded);
      } catch (err) {
        console.error("Gagal mengambil produk:", err);
        if (!cancelled) setError("Gagal mengambil data produk dari Firestore. Periksa koneksi dan aturan akses Firebase.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchProducts();
    return () => { cancelled = true; };
  }, []);

  const activeProducts = useMemo(
    () => products.filter((product) => product.isActive !== false),
    [products]
  );

  const averageSimilarity = useMemo(() => {
    if (!recommendations.length) return 0;
    return Math.round(
      recommendations.reduce((sum, item) => sum + item.similarity, 0) /
        recommendations.length * 100
    );
  }, [recommendations]);

  const highestSimilarity = useMemo(
    () => recommendations.length
      ? Math.round(Math.max(...recommendations.map((item) => item.similarity)) * 100)
      : 0,
    [recommendations]
  );

  function clearResults() {
    setRecommendations([]);
    setHasSearched(false);
  }

  function handleGenerateRecommendation() {
    if (!selectedCategory) {
      setError("Pilih kategori produk terlebih dahulu.");
      setRecommendations([]);
      setHasSearched(false);
      return;
    }

    setError("");
    setLoadingRecommendation(true);
    setHasSearched(true);

    try {
      const priceOption = priceOptions.find((item) => item.label === selectedPrice);
      const result = getRecommendations(
        selectedCategory,
        activeProducts,
        {
          taste: selectedTaste === "Semua Rasa" ? undefined : selectedTaste,
          size: selectedSize === "Semua Ukuran" ? undefined : selectedSize,
          minPrice: priceOption?.minPrice,
          maxPrice: priceOption?.maxPrice,
        },
        5
      );
      setRecommendations(result);
      if (!result.length) {
        setError("Tidak ada produk yang sesuai dengan seluruh filter. Coba ubah rasa, ukuran, atau rentang harga.");
      }
    } catch (err) {
      console.error("Gagal menghitung rekomendasi:", err);
      setRecommendations([]);
      setError("Rekomendasi gagal dihitung. Periksa struktur data produk dan file algoritma.");
    } finally {
      setLoadingRecommendation(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7fbea] text-gray-900">
      <header className="border-b border-green-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-700 text-white">
              <FiCpu className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold">Rekomendasi Produk</h1>
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">Content-Based Filtering</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">Pengujian rekomendasi produk Roti Sajiyem</p>
            </div>
          </div>
          <Link href="/admin" className="inline-flex w-fit items-center gap-2 rounded-xl border border-green-100 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-green-50">
            <FiArrowLeft /> Kembali ke Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        {error && (
          <div role="alert" className="mb-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <span className="mt-0.5"><FiCheckCircle /></span>
            <p>{error}</p>
          </div>
        )}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat title="Total Produk" value={products.length} icon={<FiPackage />} />
          <Stat title="Produk Aktif" value={activeProducts.length} icon={<FiCheckCircle />} />
          <Stat title="Rata-rata Similarity" value={`${averageSimilarity}%`} icon={<FiBarChart2 />} />
          <Stat title="Similarity Tertinggi" value={`${highestSimilarity}%`} icon={<FiStar />} />
        </section>

        <section className="overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm">
          <div className="border-b border-green-100 bg-green-50/70 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white p-3 text-green-700"><FiSliders /></div>
              <div>
                <h2 className="font-bold">Form Preferensi Pengguna</h2>
                <p className="mt-1 text-sm text-gray-500">Kategori wajib dipilih. Filter lainnya bersifat opsional.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Kategori Produk" icon={<FiPackage />}>
              <select value={selectedCategory} disabled={loading} onChange={(e) => { setSelectedCategory(e.target.value); clearResults(); setError(""); }} className={selectClass}>
                <option value="">Pilih Kategori</option>
                {categoryOptions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </Field>

            <Field label="Rasa" icon={<FiFilter />}>
              <select value={selectedTaste} onChange={(e) => { setSelectedTaste(e.target.value); clearResults(); setError(""); }} className={selectClass}>
                {tasteOptions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </Field>

            <Field label="Ukuran" icon={<FiFilter />}>
              <select value={selectedSize} onChange={(e) => { setSelectedSize(e.target.value); clearResults(); setError(""); }} className={selectClass}>
                {sizeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </Field>

            <Field label="Rentang Harga" icon={<FiTag />}>
              <select value={selectedPrice} onChange={(e) => { setSelectedPrice(e.target.value); clearResults(); setError(""); }} className={selectClass}>
                {priceOptions.map((item) => <option key={item.label} value={item.label}>{item.label}</option>)}
              </select>
            </Field>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-5 sm:col-span-2 lg:col-span-4">
              <p className="text-xs text-gray-500">Maksimal 5 hasil. Filter tidak diubah otomatis jika hasil kosong.</p>
              <button type="button" disabled={loading || loadingRecommendation || !selectedCategory} onClick={handleGenerateRecommendation} className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-6 py-3 text-sm font-bold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50">
                <FiSearch /> {loadingRecommendation ? "Menghitung..." : "Tampilkan Rekomendasi"}
              </button>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">Hasil Rekomendasi</h2>
              <p className="mt-1 text-sm text-gray-500">
                {selectedCategory ? `Kategori: ${selectedCategory}` : "Pilih kategori untuk memulai."} — diurutkan berdasarkan nilai Cosine Similarity.
              </p>
            </div>
            {recommendations.length > 0 && <span className="w-fit rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">{recommendations.length} hasil</span>}
          </div>

          {!hasSearched ? (
            <div className="rounded-2xl border border-green-100 bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-700"><FiSearch className="h-6 w-6" /></div>
              <h3 className="mt-4 font-bold">Belum Ada Hasil Rekomendasi</h3>
              <p className="mt-2 text-sm text-gray-500">Pilih kategori dan preferensi, kemudian tampilkan rekomendasi.</p>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-white px-6 py-12 text-center shadow-sm">
              <h3 className="font-bold">Produk yang Cocok Tidak Ditemukan</h3>
              <p className="mt-2 text-sm text-gray-500">Ubah preferensi atau pilih rentang harga lain. Kategori tetap digunakan sebagai filter utama.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((item, index) => (
                <motion.article key={item.product.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} className="overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm">
                  <div className="relative flex h-52 items-center justify-center overflow-hidden bg-green-50">
                    {item.product.imageUrl ? (
                      <img src={item.product.imageUrl} alt={item.product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-400"><FiImage className="h-8 w-8" /><span className="text-xs">Tidak ada gambar</span></div>
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-green-800">Ranking #{index + 1}</span>
                    <span className="absolute right-3 top-3 rounded-full bg-green-700 px-3 py-1.5 text-xs font-bold text-white">{Math.round(item.similarity * 100)}% mirip</span>
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-green-700">{item.product.category}</p>
                    <h3 className="mt-1 text-lg font-bold">{item.product.name}</h3>
                    <p className="mt-3 text-lg font-bold text-green-700">{formatCurrency(item.product.price)}</p>
                    <div className="mt-4 space-y-2 text-sm">
                      <ProductDetail label="Rasa" value={item.product.taste} />
                      <ProductDetail label="Ukuran" value={item.product.size} />
                    </div>
                    <div className="mt-5">
                      <div className="mb-2 flex justify-between text-xs"><span className="font-semibold text-gray-600">Tingkat Kemiripan</span><span className="font-bold text-green-700">{Math.round(item.similarity * 100)}%</span></div>
                      <div className="h-2 overflow-hidden rounded-full bg-green-50"><div className="h-full rounded-full bg-green-700" style={{ width: `${Math.round(item.similarity * 100)}%` }} /></div>
                    </div>
                    <Link href={`/produk/${item.product.id}`} target="_blank" className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-green-100 px-4 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-50">Lihat Produk <span className="ml-2">→</span></Link>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-green-100 bg-white p-6">
          <h2 className="font-bold">Alur Metode Rekomendasi</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Method number="1" title="Filter Kategori dan Preferensi" description="Sistem mengambil produk aktif sesuai kategori, lalu menerapkan filter rasa, ukuran, dan harga yang dipilih." />
            <Method number="2" title="Pembobotan TF-IDF" description="Nama produk, kategori, rasa, dan ukuran diolah menjadi vektor berbobot TF-IDF." />
            <Method number="3" title="Cosine Similarity" description="Vektor setiap produk dibandingkan dengan profil preferensi. Produk diurutkan dari skor tertinggi dan maksimal lima ditampilkan." />
          </div>
          <p className="mt-4 rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-800">
            Catatan metodologis: skor kemiripan adalah hasil perbandingan teks, bukan persentase kepuasan pengguna. Jika kategori sudah dipilih sebagai filter, kategori yang sama pada semua kandidat tidak banyak membedakan urutan. Hasil perlu dievaluasi dengan data pengujian yang nyata.
          </p>
        </section>
      </div>
    </main>
  );
}

const selectClass = "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm outline-none transition focus:border-green-600 focus:bg-white focus:ring-4 focus:ring-green-50";

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-gray-700"><span className="mb-2 flex items-center gap-2">{icon}<span>{label}</span></span>{children}</label>;
}

function Stat({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</p><span className="text-green-700">{icon}</span></div><p className="mt-3 text-2xl font-bold">{value}</p></div>;
}

function ProductDetail({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"><span className="text-gray-500">{label}</span><span className="font-semibold">{value}</span></div>;
}

function Method({ number, title, description }: { number: string; title: string; description: string }) {
  return <div className="rounded-xl border border-green-100 p-4"><span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-700 text-sm font-bold text-white">{number}</span><h3 className="mt-3 font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-gray-500">{description}</p></div>;
}
