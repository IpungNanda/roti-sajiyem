
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiDollarSign,
  FiFilter,
  FiHeart,
  FiInfo,
  FiRefreshCw,
  FiSearch,
  FiShoppingBag,
  FiSliders,
  FiStar,
  FiTag,
  FiTrendingUp,
  FiX,
} from "react-icons/fi";
import { GiBread, GiCakeSlice } from "react-icons/gi";

import { db } from "@/lib/firebase";
import type { Product } from "@/types/product";
import {
  getRecommendations,
  type RecommendationResult,
} from "@/lib/recommendation/recommend";
import { similarityToPercentage } from "@/lib/recommendation/cosineSimilarity";

const categories = [
  "Bolu Gulung",
  "Mandarin",
  "Prol",
  "Krumpul",
  "Bolu Belah",
  "Bolu Selai",
  "Roti Kacang",
];

const priceRanges = [
  { label: "Semua Harga", min: undefined, max: undefined },
  { label: "Rp12.000–Rp25.000", min: 12000, max: 25000 },
  { label: "Rp26.000–Rp50.000", min: 26000, max: 50000 },
  { label: "Rp51.000–Rp100.000", min: 51000, max: 100000 },
  { label: "Rp101.000–Rp130.000", min: 101000, max: 130000 },
  { label: "Di atas Rp130.000", min: 130001, max: undefined },
];

const sizes = ["Semua Ukuran", "Kecil", "Besar"];

const fieldClass =
  "mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-3.5 text-sm text-stone-800 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-stone-100";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);

export default function RekomendasiPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState("");
  const [taste, setTaste] = useState("");
  const [size, setSize] = useState("Semua Ukuran");
  const [priceLabel, setPriceLabel] = useState("Semua Harga");
  const [results, setResults] = useState<RecommendationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const snapshot = await getDocs(collection(db, "products"));

        const data: Product[] = snapshot.docs.map((item) => {
          const raw = item.data();

          return {
            id: item.id,
            name: String(raw.name ?? ""),
            category: String(raw.category ?? ""),
            taste: String(raw.taste ?? ""),
            size: String(raw.size ?? ""),
            price: Number(raw.price ?? 0),
            variant: String(raw.variant ?? ""),
            filling: String(raw.filling ?? ""),
            description: String(raw.description ?? ""),
            imageUrl: String(raw.imageUrl ?? ""),
            isActive: raw.isActive !== false,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
            occasion: Array.isArray(raw.occasion)
              ? raw.occasion.map(String)
              : typeof raw.occasion === "string"
                ? raw.occasion
                    .split(",")
                    .map((x: string) => x.trim())
                    .filter(Boolean)
                : [],
          } as Product;
        });

        if (!cancelled) {
          setProducts(data.filter((product) => product.isActive !== false));
        }
      } catch (e) {
        console.error(e);

        if (!cancelled) {
          setError(
            "Gagal mengambil data produk. Periksa koneksi dan aturan Firestore."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const categoryProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.category.trim().toLowerCase() ===
          category.trim().toLowerCase()
      ),
    [products, category]
  );

  const availableTastes = useMemo(
    () => [
      ...new Set(
        categoryProducts.map((product) => product.taste.trim()).filter(Boolean)
      ),
    ],
    [categoryProducts]
  );

  function changeCategory(value: string) {
    setCategory(value);
    setTaste("");
    setResults([]);
    setError("");
  }

  function resetForm() {
    setCategory("");
    setTaste("");
    setSize("Semua Ukuran");
    setPriceLabel("Semua Harga");
    setResults([]);
    setError("");
  }

  function handleSearch() {
    setError("");
    setResults([]);

    if (!category) {
      setError("Pilih kategori produk terlebih dahulu.");
      return;
    }

    const price = priceRanges.find((item) => item.label === priceLabel);

    setProcessing(true);

    try {
      const recommendations = getRecommendations(
        category,
        products,
        {
          taste: taste || undefined,
          minPrice: price?.min,
          maxPrice: price?.max,
          size: size === "Semua Ukuran" ? undefined : size,
        },
        5
      );

      setResults(recommendations);

      if (recommendations.length === 0) {
        setError(
          "Belum ditemukan produk yang sesuai. Coba ubah rasa, ukuran, atau anggaran."
        );
      }
    } catch (e) {
      console.error(e);
      setError("Terjadi kesalahan saat menghitung rekomendasi.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f8f1] text-stone-800">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-950 via-green-900 to-green-800 text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-lime-300/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-yellow-300/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:px-8 lg:pb-20">
          <nav className="mb-12 flex items-center justify-between sm:mb-16">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl transition hover:opacity-80"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-2xl text-lime-300">
                <GiBread />
              </span>
              <span>
                <span className="block text-sm font-extrabold tracking-wide">
                  ROTI SAJIYEM
                </span>
                <span className="mt-1 block text-xs text-green-100/70">
                  Kelezatan sejak 2000
                </span>
              </span>
            </Link>

            <Link
              href="/produk"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-xs font-bold transition hover:bg-white/10 sm:px-5 sm:text-sm"
            >
              <FiShoppingBag />
              <span className="hidden xs:inline">Katalog Produk</span>
              <span className="xs:hidden">Produk</span>
              <FiArrowRight />
            </Link>
          </nav>

          <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-white/10 px-4 py-2 text-xs font-semibold text-lime-100 sm:text-sm">
                <FiStar className="text-lime-300" />
                Temukan roti favorit Anda
              </span>

              <h1 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                Rekomendasi Roti
                <span className="mt-1 block text-lime-300">
                  Sesuai Selera Anda.
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-green-50/80 sm:text-base sm:leading-8">
                Pilih kategori, rasa, ukuran, dan anggaran untuk menemukan
                produk Roti Sajiyem yang sesuai dengan kebutuhan Anda.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs text-green-50 sm:text-sm">
                  <FiCheckCircle className="text-lime-300" />
                  Pilihan fleksibel
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs text-green-50 sm:text-sm">
                  <FiDollarSign className="text-lime-300" />
                  Sesuai anggaran
                </div>
              </div>
            </div>

            <div className="mx-auto w-full max-w-sm lg:max-w-none">
              <div className="rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-md sm:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-green-50/70">
                      Mulai dari sini
                    </p>
                    <h2 className="mt-2 text-xl font-extrabold sm:text-2xl">
                      Temukan pilihanmu
                    </h2>
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-lime-300/15 text-2xl text-lime-300">
                    <GiCakeSlice />
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    {
                      icon: <FiFilter />,
                      title: "Pilih kategori",
                      desc: "Tentukan jenis roti favorit",
                    },
                    {
                      icon: <FiDollarSign />,
                      title: "Atur anggaran",
                      desc: "Sesuaikan dengan budget Anda",
                    },
                    {
                      icon: <FiTrendingUp />,
                      title: "Lihat rekomendasi",
                      desc: "Temukan produk yang relevan",
                    },
                  ].map((item, index) => (
                    <div
                      key={item.title}
                      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.07] p-3 sm:p-4"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime-300/15 text-xl text-lime-300">
                        {item.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold">{item.title}</p>
                        <p className="mt-1 text-xs text-green-50/65">
                          {item.desc}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-lime-300">
                        0{index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* FORM FILTER */}
        <section className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-[0_15px_50px_-30px_rgba(20,83,45,0.25)] sm:p-8 lg:p-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-xl text-green-800 sm:h-14 sm:w-14 sm:text-2xl">
                <FiSliders />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">
                  Atur preferensi
                </p>
                <h2 className="mt-1 text-xl font-extrabold text-stone-900 sm:text-2xl">
                  Roti seperti apa yang Anda cari?
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-stone-500">
                  Tentukan kategori produk, lalu sesuaikan pilihan lainnya.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowFilters((current) => !current)}
              aria-expanded={showFilters}
              aria-label={showFilters ? "Tutup filter" : "Buka filter"}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-stone-200 text-stone-600 transition hover:bg-stone-50 sm:hidden"
            >
              {showFilters ? <FiX /> : <FiChevronDown />}
            </button>
          </div>

          {loading ? (
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="animate-pulse">
                  <div className="mb-3 h-4 w-24 rounded bg-stone-200" />
                  <div className="h-12 rounded-xl bg-stone-100" />
                </div>
              ))}
              <p className="text-sm text-stone-500 sm:col-span-2">
                Memuat data produk...
              </p>
            </div>
          ) : (
            <div
              className={`${showFilters ? "mt-7 grid" : "hidden"} gap-x-5 gap-y-6 sm:grid sm:grid-cols-2`}
            >
              <label className="block text-sm font-semibold text-stone-700">
                Kategori produk <span className="text-red-500">*</span>
                <select
                  value={category}
                  onChange={(e) => changeCategory(e.target.value)}
                  className={fieldClass}
                >
                  <option value="">Pilih kategori</option>
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-semibold text-stone-700">
                Rasa
                <select
                  value={taste}
                  onChange={(e) => {
                    setTaste(e.target.value);
                    setResults([]);
                    setError("");
                  }}
                  className={fieldClass}
                  disabled={!category}
                >
                  <option value="">Semua rasa</option>
                  {availableTastes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-semibold text-stone-700">
                Ukuran
                <select
                  value={size}
                  onChange={(e) => {
                    setSize(e.target.value);
                    setResults([]);
                    setError("");
                  }}
                  className={fieldClass}
                >
                  {sizes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-semibold text-stone-700">
                Anggaran harga
                <select
                  value={priceLabel}
                  onChange={(e) => {
                    setPriceLabel(e.target.value);
                    setResults([]);
                    setError("");
                  }}
                  className={fieldClass}
                >
                  {priceRanges.map((item) => (
                    <option key={item.label} value={item.label}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          <div
            className={`${loading ? "hidden" : ""} ${showFilters ? "flex" : "hidden"} mt-7 flex-col gap-3 sm:flex sm:flex-row`}
          >
            <button
              type="button"
              onClick={handleSearch}
              disabled={loading || processing || products.length === 0}
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-green-800 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-900/10 transition hover:-translate-y-0.5 hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {processing ? (
                <>
                  <FiRefreshCw className="animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <FiSearch />
                  Cari Rekomendasi
                  <FiArrowRight />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-6 py-3.5 text-sm font-bold text-stone-600 transition hover:border-stone-300 hover:bg-stone-50"
            >
              <FiRefreshCw />
              Reset Pilihan
            </button>
          </div>

          {error && (
            <div
              role="status"
              className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"
            >
              <FiInfo className="mt-0.5 shrink-0 text-lg" />
              <p>{error}</p>
            </div>
          )}

          {!loading && products.length === 0 && !error && (
            <p className="mt-5 rounded-xl bg-stone-50 p-4 text-sm text-stone-500">
              Belum ada produk aktif yang tersedia untuk direkomendasikan.
            </p>
          )}
        </section>

        {/* HASIL REKOMENDASI */}
        {results.length > 0 && (
          <section className="mt-12 sm:mt-16">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">
                  Hasil pencarian
                </p>
                <h2 className="mt-2 text-2xl font-extrabold text-stone-900 sm:text-3xl">
                  Rekomendasi untuk Anda
                </h2>
                <p className="mt-2 text-sm leading-6 text-stone-500">
                  Produk pilihan berdasarkan preferensi yang Anda masukkan.
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-800">
                <FiCheckCircle />
                {results.length} produk ditemukan
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map(({ product, similarity }, index) => {
                const score = Math.min(
                  100,
                  Math.max(0, similarityToPercentage(similarity))
                );

                return (
                  <article
                    key={product.id}
                    className="group flex h-full flex-col overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-950/10"
                  >
                    <div className="relative h-52 overflow-hidden bg-gradient-to-br from-green-50 to-stone-100 sm:h-56">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-2 text-stone-400">
                          <GiCakeSlice className="text-5xl" />
                          <span className="text-xs">
                            Gambar belum tersedia
                          </span>
                        </div>
                      )}

                      <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/95 px-3 py-1.5 text-xs font-bold text-green-800 shadow-sm">
                        <FiStar />
                        Pilihan #{index + 1}
                      </span>

                      <span className="absolute right-4 top-4 rounded-full bg-green-800/90 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
                        {score}% cocok
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-green-700">
                        <FiTag />
                        {product.category}
                      </p>

                      <h3 className="mt-2 text-lg font-extrabold leading-snug text-stone-900">
                        {product.name}
                      </h3>

                      <p className="mt-3 text-xl font-extrabold text-green-800">
                        {formatPrice(product.price)}
                      </p>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="rounded-xl bg-stone-50 p-3">
                          <p className="flex items-center gap-1.5 text-[11px] font-medium text-stone-500">
                            <FiHeart />
                            Rasa
                          </p>
                          <p className="mt-1 truncate text-sm font-bold text-stone-800">
                            {product.taste || "Tidak tersedia"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-stone-50 p-3">
                          <p className="flex items-center gap-1.5 text-[11px] font-medium text-stone-500">
                            <FiShoppingBag />
                            Ukuran
                          </p>
                          <p className="mt-1 truncate text-sm font-bold text-stone-800">
                            {product.size || "Tidak tersedia"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                          <span className="font-semibold text-stone-500">
                            Skor kemiripan
                          </span>
                          <span className="font-extrabold text-green-800">
                            {score}%
                          </span>
                        </div>

                        <div
                          className="h-2 overflow-hidden rounded-full bg-stone-100"
                          role="progressbar"
                          aria-label={`Skor kemiripan ${product.name}`}
                          aria-valuenow={score}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        >
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-green-600 to-lime-400 transition-all duration-700"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>

                      <Link
                        href={`/produk/${product.id}`}
                        className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-green-800 px-4 py-3 text-sm font-bold text-green-800 transition hover:bg-green-800 hover:text-white"
                      >
                        Lihat Detail Produk
                        <FiArrowRight />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="mt-12 rounded-3xl border border-green-100 bg-green-50/80 p-5 sm:mt-16 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl text-green-800 shadow-sm">
              <GiBread />
            </div>

            <div>
              <h2 className="font-extrabold text-stone-900">
                Ingin melihat pilihan lainnya?
              </h2>
              <p className="mt-1 text-sm leading-6 text-stone-600">
                Jelajahi katalog lengkap produk Roti Sajiyem dan temukan
                pilihan favorit Anda.
              </p>
            </div>

            <Link
              href="/produk"
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-green-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-900 sm:ml-auto"
            >
              Jelajahi Produk
              <FiArrowRight />
            </Link>
          </div>
        </section>

        <footer className="pb-2 pt-8 text-center text-xs text-stone-400 sm:pt-10">
          © {new Date().getFullYear()} Roti Sajiyem. Semua hak dilindungi.
        </footer>
      </div>
    </main>
  );
}
