
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import {
  FiSearch,
  FiShoppingBag,
  FiArrowRight,
  FiPackage,
  FiRefreshCw,
  FiFilter,
  FiX,
} from "react-icons/fi";

import { db } from "@/lib/firebase";

type Product = {
  id: string;
  name: string;
  category: string;
  taste: string;
  size: string;
  price: number;
  description: string;
  imageUrl: string;
  isActive: boolean;
};

const CATEGORY_ORDER = [
  "Bolu Gulung",
  "Mandarin",
  "Prol",
  "Krumpul",
  "Bolu Belah",
  "Bolu Selai",
  "Roti Kacang",
];

const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const normalize = (value: string) =>
  value.trim().toLocaleLowerCase("id-ID");

export default function ProdukPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [queryText, setQueryText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const snapshot = await getDocs(collection(db, "products"));

        const rows: Product[] = snapshot.docs.map((item) => {
          const data = item.data();

          return {
            id: item.id,
            name: String(data.name ?? ""),
            category: String(data.category ?? ""),
            taste: String(data.taste ?? ""),
            size: String(data.size ?? ""),
            price: Number(data.price ?? 0),
            description: String(data.description ?? ""),
            imageUrl: String(data.imageUrl ?? ""),
            isActive: data.isActive !== false,
          };
        });

        if (!cancelled) {
          setProducts(rows.filter((product) => product.isActive));
        }
      } catch (err) {
        console.error("Gagal memuat produk:", err);

        if (!cancelled) {
          setError(
            "Produk belum dapat dimuat. Silakan periksa koneksi internet dan coba kembali."
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

  const categories = useMemo(() => {
    const available = new Set(
      products
        .map((product) => product.category.trim())
        .filter(Boolean)
    );

    const ordered = CATEGORY_ORDER.filter((category) =>
      available.has(category)
    );

    const additional = [...available]
      .filter((category) => !CATEGORY_ORDER.includes(category))
      .sort((a, b) => a.localeCompare(b, "id"));

    return ["Semua", ...ordered, ...additional];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = normalize(queryText);

    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "Semua" ||
        normalize(product.category) === normalize(selectedCategory);

      const searchableText = [
        product.name,
        product.category,
        product.taste,
        product.size,
        product.description,
      ]
        .join(" ")
        .toLocaleLowerCase("id-ID");

      return matchesCategory && (!q || searchableText.includes(q));
    });
  }, [products, queryText, selectedCategory]);

  const groupedProducts = useMemo(() => {
    const groups = new Map<string, Product[]>();

    for (const product of filteredProducts) {
      const category = product.category.trim() || "Produk Lainnya";

      if (!groups.has(category)) {
        groups.set(category, []);
      }

      groups.get(category)!.push(product);
    }

    return [...groups.entries()].sort(([a], [b]) => {
      const indexA = CATEGORY_ORDER.indexOf(a);
      const indexB = CATEGORY_ORDER.indexOf(b);

      const orderA = indexA === -1 ? Infinity : indexA;
      const orderB = indexB === -1 ? Infinity : indexB;

      return orderA - orderB || a.localeCompare(b, "id");
    });
  }, [filteredProducts]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7fbea] text-gray-900">
      {/* Hero */}
      <header className="relative isolate overflow-hidden border-b border-green-100 bg-white">
        <div className="pointer-events-none absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-yellow-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 -z-10 h-64 w-64 rounded-full bg-green-100 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-800 text-white shadow-lg shadow-green-900/10 sm:h-20 sm:w-20">
            <FiShoppingBag size={32} />
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-green-700 sm:text-sm">
            Roti Sajiyem
          </p>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Temukan Roti
            <span className="block text-green-700">
              Favorit Anda
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base sm:leading-7">
            Jelajahi aneka pilihan roti dan kue Roti Sajiyem.
            Temukan rasa, ukuran, dan harga yang sesuai dengan kebutuhan Anda.
          </p>

          <div className="mx-auto mt-7 flex max-w-md items-center justify-center gap-3 rounded-2xl border border-green-100 bg-green-50/80 px-4 py-3">
            <FiPackage className="shrink-0 text-green-700" size={20} />
            <p className="text-left text-sm text-gray-700">
              <span className="font-bold text-green-800">
                {loading ? "Memuat produk..." : `${products.length} produk tersedia`}
              </span>
              <span className="block text-xs text-gray-500">
                Pilihan untuk berbagai kebutuhan
              </span>
            </p>
          </div>
        </div>
      </header>

      {/* Katalog */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Pencarian */}
        <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 transition focus-within:border-green-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-green-50">
              <FiSearch className="shrink-0 text-green-700" size={20} />
              <input
                type="search"
                value={queryText}
                onChange={(event) => setQueryText(event.target.value)}
                placeholder="Cari nama, kategori, rasa, atau ukuran..."
                className="w-full min-w-0 bg-transparent py-2 text-sm outline-none placeholder:text-gray-400"
              />

              {queryText && (
                <button
                  type="button"
                  aria-label="Hapus pencarian"
                  onClick={() => setQueryText("")}
                  className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
                >
                  <FiX size={18} />
                </button>
              )}
            </label>

            <button
              type="button"
              onClick={() => setMobileFilterOpen((current) => !current)}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-green-200 px-4 text-sm font-semibold text-green-800 transition hover:bg-green-50 sm:hidden"
            >
              <FiFilter size={18} />
              Filter Kategori
            </button>
          </div>

          {/* Filter kategori desktop */}
          <div className="mt-4 hidden flex-wrap gap-2 sm:flex">
            {categories.map((category) => {
              const active = selectedCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-green-800 text-white shadow-sm"
                      : "border border-gray-200 bg-white text-gray-600 hover:border-green-300 hover:bg-green-50 hover:text-green-800"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {/* Filter kategori mobile */}
          {mobileFilterOpen && (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:hidden">
              {categories.map((category) => {
                const active = selectedCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category);
                      setMobileFilterOpen(false);
                    }}
                    className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${
                      active
                        ? "bg-green-800 text-white"
                        : "border border-gray-200 bg-white text-gray-700 hover:bg-green-50"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Informasi hasil */}
        {!loading && !error && (
          <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                {selectedCategory === "Semua"
                  ? "Jelajahi Semua Produk"
                  : selectedCategory}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {filteredProducts.length} produk ditemukan
                {queryText.trim() ? ` untuk "${queryText.trim()}"` : ""}
              </p>
            </div>

            {(queryText || selectedCategory !== "Semua") && (
              <button
                type="button"
                onClick={() => {
                  setQueryText("");
                  setSelectedCategory("Semua");
                }}
                className="self-start text-sm font-semibold text-green-700 hover:text-green-900 sm:self-auto"
              >
                Reset filter
              </button>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <FiRefreshCw
              className="animate-spin text-green-700"
              size={30}
            />
            <p className="mt-4 text-sm text-gray-500">
              Menyiapkan katalog produk...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Produk dikelompokkan berdasarkan kategori */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="mt-7 space-y-10 sm:mt-9 sm:space-y-12">
            {groupedProducts.map(([category, items]) => (
              <section key={category}>
                <div className="mb-5 flex items-center gap-3">
                  <div className="h-8 w-1.5 shrink-0 rounded-full bg-green-700" />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-gray-900 sm:text-xl">
                      {category}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                      {items.length} pilihan produk
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-800">
                    {items.length} produk
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                  {items.map((product) => (
                    <article
                      key={product.id}
                      className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-lg"
                    >
                      {/* Gambar produk */}
                      <Link
                        href={`/produk/${product.id}`}
                        aria-label={`Lihat detail ${product.name}`}
                        className="relative block overflow-hidden bg-green-50"
                      >
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            loading="lazy"
                            className="h-52 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-56"
                          />
                        ) : (
                          <div className="flex h-52 items-center justify-center text-green-700 sm:h-56">
                            <FiShoppingBag size={42} />
                          </div>
                        )}

                        <span className="absolute left-3 top-3 max-w-[85%] truncate rounded-full border border-white/70 bg-white/95 px-3 py-1.5 text-[11px] font-bold text-green-800 shadow-sm">
                          {category}
                        </span>
                      </Link>

                      {/* Informasi produk */}
                      <div className="flex flex-1 flex-col p-4 sm:p-5">
                        <h4 className="line-clamp-2 min-h-12 text-base font-bold leading-6 text-gray-900 sm:text-lg">
                          {product.name || "Produk Roti Sajiyem"}
                        </h4>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {product.taste && (
                            <span className="rounded-lg bg-yellow-50 px-2.5 py-1.5 text-xs font-medium text-yellow-800">
                              {product.taste}
                            </span>
                          )}
                          {product.size && (
                            <span className="rounded-lg bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-800">
                              {product.size}
                            </span>
                          )}
                        </div>

                        {product.description && (
                          <p className="mt-3 line-clamp-2 text-sm leading-5 text-gray-500">
                            {product.description}
                          </p>
                        )}

                        <div className="mt-auto pt-5">
                          <p className="text-xs text-gray-500">
                            Harga produk
                          </p>
                          <p className="mt-1 text-xl font-extrabold text-green-800">
                            {rupiah(product.price)}
                          </p>

                          <Link
                            href={`/produk/${product.id}`}
                            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-green-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-900 focus:outline-none focus:ring-4 focus:ring-green-100"
                          >
                            Lihat Detail
                            <FiArrowRight
                              size={17}
                              className="transition group-hover:translate-x-1"
                            />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Tidak ada hasil */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-green-200 bg-white px-5 py-14 text-center sm:py-20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-700">
              <FiSearch size={28} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-gray-900">
              Produk tidak ditemukan
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Coba gunakan kata kunci lain atau pilih kategori yang berbeda.
            </p>

            <button
              type="button"
              onClick={() => {
                setQueryText("");
                setSelectedCategory("Semua");
              }}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-green-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-900"
            >
              Tampilkan Semua Produk
            </button>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-green-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
          <div className="flex items-center gap-2 text-sm font-bold text-green-800">
            <FiShoppingBag size={18} />
            Roti Sajiyem
          </div>
          <p className="text-xs leading-5 text-gray-500">
            Pilihan roti dan kue untuk berbagai kebutuhan Anda.
          </p>
        </div>
      </footer>
    </main>
  );
}
