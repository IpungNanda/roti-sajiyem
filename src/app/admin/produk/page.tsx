
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import {
  FiEdit2,
  FiPackage,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiAlertCircle,
  FiTag,
  FiMaximize2,
} from "react-icons/fi";

import { db } from "@/lib/firebase";

type Product = {
  id: string;
  name: string;
  category: string;
  taste: string;
  size: string;
  price: number;
  isActive: boolean;
};

const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export default function ProdukAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProducts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const snap = await getDocs(
        query(
          collection(db, "products"),
          orderBy("createdAt", "desc")
        )
      );

      const loadedProducts: Product[] = snap.docs.map((item) => {
        const data = item.data();

        return {
          id: item.id,
          name: String(data.name ?? ""),
          category: String(data.category ?? ""),
          taste: String(data.taste ?? ""),
          size: String(data.size ?? ""),
          price: Number(data.price ?? 0),
          // Dokumen lama tanpa isActive tetap dianggap aktif.
          isActive: data.isActive !== false,
        };
      });

      setProducts(loadedProducts);
    } catch (err) {
      console.error("Gagal mengambil produk:", err);
      setError(
        "Gagal memuat produk. Periksa koneksi internet dan aturan Firestore."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchProducts();

  }, [fetchProducts]);

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(
      `Hapus produk "${product.name}"?\n\nTindakan ini tidak dapat dibatalkan.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(product.id);
      setError("");

      await deleteDoc(doc(db, "products", product.id));

      setProducts((current) =>
        current.filter((item) => item.id !== product.id)
      );
    } catch (err) {
      console.error("Gagal menghapus produk:", err);
      setError("Produk gagal dihapus. Silakan coba lagi.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen min-w-0 bg-[#f7fbea]">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
        {/* Header halaman */}
        <section className="overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm">
          <header className="flex flex-col gap-5 border-b border-green-100 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700 sm:h-14 sm:w-14">
                <FiPackage size={25} />
              </div>

              <div className="min-w-0">
                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  Daftar Produk
                </h1>
                <p className="mt-1 text-sm leading-5 text-gray-500">
                  Kelola produk Roti Sajiyem
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
              <button
                type="button"
                onClick={() => void fetchProducts(true)}
                disabled={loading || refreshing}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-green-200 px-4 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiRefreshCw
                  className={refreshing ? "animate-spin" : ""}
                  size={17}
                />
                {refreshing ? "Memuat..." : "Refresh Data"}
              </button>

              <Link
                href="/admin/produk/tambah"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-100"
              >
                <FiPlus size={18} />
                Tambah Produk
              </Link>
            </div>
          </header>

          {/* Ringkasan */}
          <div className="grid grid-cols-2 gap-3 border-b border-green-100 bg-green-50/40 p-4 sm:grid-cols-3 sm:gap-4 sm:p-6">
            <div className="rounded-xl border border-green-100 bg-white p-4">
              <p className="text-xs font-medium text-gray-500 sm:text-sm">
                Total Produk
              </p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {loading ? "..." : products.length}
              </p>
            </div>

            <div className="rounded-xl border border-green-100 bg-white p-4">
              <p className="text-xs font-medium text-gray-500 sm:text-sm">
                Produk Aktif
              </p>
              <p className="mt-2 text-2xl font-bold text-green-700">
                {loading
                  ? "..."
                  : products.filter((product) => product.isActive).length}
              </p>
            </div>

            <div className="col-span-2 rounded-xl border border-green-100 bg-white p-4 sm:col-span-1">
              <p className="text-xs font-medium text-gray-500 sm:text-sm">
                Total Kategori
              </p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {loading
                  ? "..."
                  : new Set(
                      products
                        .map((product) => product.category)
                        .filter(Boolean)
                    ).size}
              </p>
            </div>
          </div>

          {/* Pesan error */}
          {error && (
            <div
              role="alert"
              className="m-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:m-6"
            >
              <FiAlertCircle className="mt-0.5 shrink-0" size={19} />
              <p>{error}</p>
            </div>
          )}

          {/* Kondisi loading */}
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 px-5 py-16">
              <FiRefreshCw
                className="animate-spin text-green-700"
                size={28}
              />
              <p className="text-sm text-gray-500">
                Memuat data produk...
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center px-5 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-700">
                <FiPackage size={30} />
              </div>

              <h2 className="mt-4 font-bold text-gray-900">
                Belum ada produk
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                Tambahkan produk Roti Sajiyem agar produk dapat dikelola
                melalui halaman ini.
              </p>

              <Link
                href="/admin/produk/tambah"
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800"
              >
                <FiPlus size={18} />
                Tambah Produk
              </Link>
            </div>
          ) : (
            <>
              {/* Tampilan HP: kartu produk */}
              <div className="space-y-3 p-4 sm:p-5 lg:hidden">
                {products.map((product, index) => (
                  <article
                    key={product.id}
                    className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-sm font-bold text-green-800">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <h3 className="break-words font-bold text-gray-900">
                            {product.name || "Tanpa nama"}
                          </h3>

                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              product.isActive
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {product.isActive ? "Aktif" : "Nonaktif"}
                          </span>
                        </div>

                        <p className="mt-1 break-all text-[11px] text-gray-400">
                          ID: {product.id}
                        </p>

                        <p className="mt-3 text-lg font-bold text-green-700">
                          {rupiah(product.price)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-[11px] text-gray-500">
                          Kategori
                        </p>
                        <p className="mt-1 break-words text-sm font-medium text-gray-800">
                          {product.category || "-"}
                        </p>
                      </div>

                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-[11px] text-gray-500">
                          Rasa
                        </p>
                        <p className="mt-1 text-sm font-medium text-gray-800">
                          {product.taste || "-"}
                        </p>
                      </div>

                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-[11px] text-gray-500">
                          Ukuran
                        </p>
                        <p className="mt-1 text-sm font-medium text-gray-800">
                          {product.size || "-"}
                        </p>
                      </div>

                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-[11px] text-gray-500">
                          Nomor Produk
                        </p>
                        <p className="mt-1 text-sm font-medium text-gray-800">
                          #{index + 1}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 border-t border-gray-100 pt-4">
                      <Link
                        href={`/admin/produk/${product.id}`}
                        aria-label={`Edit ${product.name}`}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-green-200 px-3 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-50"
                      >
                        <FiEdit2 size={16} />
                        Edit
                      </Link>

                      <button
                        type="button"
                        disabled={deletingId === product.id}
                        onClick={() => void handleDelete(product)}
                        aria-label={`Hapus ${product.name}`}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        <FiTrash2 size={16} />
                        {deletingId === product.id
                          ? "Menghapus..."
                          : "Hapus"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {/* Tampilan desktop: tabel */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-green-50 text-xs uppercase tracking-wide text-green-800">
                    <tr>
                      <th className="whitespace-nowrap px-5 py-4">No</th>
                      <th className="px-5 py-4">Nama Produk</th>
                      <th className="px-5 py-4">Kategori</th>
                      <th className="px-5 py-4">Rasa</th>
                      <th className="px-5 py-4">Ukuran</th>
                      <th className="px-5 py-4">Harga</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4 text-center">Aksi</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {products.map((product, index) => (
                      <tr
                        key={product.id}
                        className="transition hover:bg-green-50/40"
                      >
                        <td className="px-5 py-4 text-gray-500">
                          {index + 1}
                        </td>

                        <td className="max-w-[260px] px-5 py-4">
                          <p className="break-words font-semibold text-gray-900">
                            {product.name || "-"}
                          </p>
                          <p className="mt-1 break-all text-[11px] text-gray-400">
                            ID: {product.id}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-gray-700">
                          {product.category || "-"}
                        </td>

                        <td className="px-5 py-4 text-gray-700">
                          {product.taste || "-"}
                        </td>

                        <td className="px-5 py-4 text-gray-700">
                          {product.size || "-"}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-green-700">
                          {rupiah(product.price)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
                              product.isActive
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {product.isActive ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-center gap-2">
                            <Link
                              aria-label={`Edit ${product.name}`}
                              title="Edit produk"
                              href={`/admin/produk/${product.id}`}
                              className="rounded-lg border border-green-200 p-2.5 text-green-700 transition hover:bg-green-50"
                            >
                              <FiEdit2 size={17} />
                            </Link>

                            <button
                              type="button"
                              title="Hapus produk"
                              aria-label={`Hapus ${product.name}`}
                              disabled={deletingId === product.id}
                              onClick={() =>
                                void handleDelete(product)
                              }
                              className="rounded-lg border border-red-200 p-2.5 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                            >
                              <FiTrash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer tabel */}
              <footer className="flex flex-col gap-2 border-t border-green-100 bg-gray-50/70 px-5 py-4 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Menampilkan{" "}
                  <span className="font-semibold text-gray-800">
                    {products.length}
                  </span>{" "}
                  produk
                </p>
                <p className="flex items-center gap-1.5">
                  <FiTag size={14} />
                  Data produk Roti Sajiyem
                </p>
              </footer>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
