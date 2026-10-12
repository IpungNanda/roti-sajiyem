
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiMessageCircle,
  FiPackage,
  FiShoppingBag,
  FiTag,
  FiAlertCircle,
  FiRefreshCw,
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

const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export default function DetailProdukPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      if (!id) {
        setError("ID produk tidak ditemukan.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const snapshot = await getDoc(doc(db, "products", id));

        if (!snapshot.exists()) {
          throw new Error("Produk tidak ditemukan.");
        }

        const data = snapshot.data();

        if (data.isActive === false) {
          throw new Error("Produk ini sedang tidak tersedia.");
        }

        const loadedProduct: Product = {
          id: snapshot.id,
          name: String(data.name ?? ""),
          category: String(data.category ?? ""),
          taste: String(data.taste ?? ""),
          size: String(data.size ?? ""),
          price: Number(data.price ?? 0),
          description: String(data.description ?? ""),
          imageUrl: String(data.imageUrl ?? ""),
          isActive: data.isActive !== false,
        };

        if (!cancelled) setProduct(loadedProduct);
      } catch (err) {
        console.error("Gagal memuat detail produk:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Gagal memuat detail produk."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  function orderWhatsApp() {
    if (!product || ordering) return;

    const number = (
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ""
    ).replace(/\D/g, "");

    if (!number) {
      window.alert(
        "Nomor WhatsApp belum dikonfigurasi. Periksa NEXT_PUBLIC_WHATSAPP_NUMBER di file .env.local."
      );
      return;
    }

    const message = [
      "Halo Roti Sajiyem, saya ingin memesan produk berikut:",
      "",
      `Nama Produk: ${product.name}`,
      `Kategori: ${product.category || "-"}`,
      `Rasa: ${product.taste || "-"}`,
      `Ukuran: ${product.size || "-"}`,
      `Harga: ${rupiah(product.price)}`,
      "",
      "Apakah produk tersebut masih tersedia?",
    ].join("\n");

    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank", "noopener,noreferrer");
  }

  // Tampilan loading
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7fbea] px-4">
        <div className="flex flex-col items-center rounded-2xl border border-green-100 bg-white px-8 py-10 shadow-sm">
          <FiRefreshCw
            className="animate-spin text-green-700"
            size={30}
          />
          <p className="mt-4 text-sm font-medium text-gray-600">
            Memuat detail produk...
          </p>
        </div>
      </main>
    );
  }

  // Tampilan error
  if (error || !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7fbea] px-4 py-10">
        <section className="w-full max-w-md rounded-3xl border border-green-100 bg-white p-7 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <FiAlertCircle size={30} />
          </div>

          <h1 className="mt-5 text-xl font-bold text-gray-900">
            Produk tidak tersedia
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            {error || "Produk yang kamu cari tidak ditemukan."}
          </p>

          <Link
            href="/produk"
            className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-green-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-900"
          >
            <FiArrowLeft size={17} />
            Kembali ke Produk
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7fbea]">
      {/* Header */}
      <header className="border-b border-green-100 bg-white">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/produk"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-green-800 transition hover:text-green-950"
          >
            <FiArrowLeft size={19} />
            <span>Kembali ke Produk</span>
          </Link>

          <Link
            href="/produk"
            className="hidden items-center gap-2 text-sm font-bold text-gray-800 sm:inline-flex"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-800 text-white">
              <FiShoppingBag size={18} />
            </span>
            Roti Sajiyem
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-9 lg:px-8 lg:py-12">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-2 text-xs text-gray-500 sm:text-sm"
        >
          <Link href="/" className="transition hover:text-green-800">
            Beranda
          </Link>
          <span>/</span>
          <Link
            href="/produk"
            className="transition hover:text-green-800"
          >
            Produk
          </Link>
          <span>/</span>
          <span className="max-w-[180px] truncate font-medium text-green-800 sm:max-w-xs">
            {product.name}
          </span>
        </nav>

        {/* Detail produk */}
        <article className="overflow-hidden rounded-3xl border border-green-100 bg-white shadow-sm">
          <div className="grid min-w-0 grid-cols-1 lg:grid-cols-2">
            {/* Gambar */}
            <div className="relative min-w-0 bg-green-50">
              <div className="relative flex min-h-[280px] items-center justify-center sm:min-h-[380px] lg:min-h-[560px]">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    fetchPriority="high"
                    className="absolute inset-0 h-full w-full object-contain p-3 sm:p-6"
                  />
                ) : (
                  <div className="flex h-full min-h-[280px] w-full flex-col items-center justify-center text-green-700 sm:min-h-[380px]">
                    <FiShoppingBag size={60} />
                    <p className="mt-4 text-sm font-medium">
                      Gambar produk belum tersedia
                    </p>
                  </div>
                )}

                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/80 bg-white/95 px-3 py-2 text-xs font-bold text-green-800 shadow-sm sm:left-6 sm:top-6">
                  <FiPackage size={15} />
                  {product.category || "Produk Roti Sajiyem"}
                </div>
              </div>

              <div className="border-t border-green-100 bg-white/80 px-5 py-3 sm:px-7">
                <p className="text-xs leading-5 text-gray-500">
                  Foto produk Roti Sajiyem
                </p>
              </div>
            </div>

            {/* Informasi */}
            <div className="flex min-w-0 flex-col p-5 sm:p-8 lg:p-10 xl:p-12">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-green-700">
                <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                Detail Produk
              </div>

              <h1 className="mt-4 break-words text-2xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
                {product.name}
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-500 sm:text-base">
                Pilihan roti dan kue dari Roti Sajiyem untuk menemani
                berbagai momen Anda.
              </p>

              {/* Harga */}
              <div className="mt-6 rounded-2xl border border-green-100 bg-green-50/70 p-5 sm:p-6">
                <p className="text-xs font-medium text-gray-500 sm:text-sm">
                  Harga Produk
                </p>
                <p className="mt-2 break-words text-2xl font-extrabold text-green-800 sm:text-3xl">
                  {rupiah(product.price)}
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-green-800">
                  <FiCheckCircle size={14} />
                  Informasi harga produk
                </p>
              </div>

              {/* Spesifikasi */}
              <section className="mt-7">
                <h2 className="text-sm font-bold text-gray-900 sm:text-base">
                  Informasi Produk
                </h2>

                <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-gray-100 bg-white p-4">
                    <dt className="flex items-center gap-2 text-xs text-gray-500">
                      <FiTag className="text-green-700" size={15} />
                      Kategori
                    </dt>
                    <dd className="mt-2 break-words text-sm font-semibold text-gray-900">
                      {product.category || "-"}
                    </dd>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-white p-4">
                    <dt className="text-xs text-gray-500">
                      Rasa
                    </dt>
                    <dd className="mt-2 break-words text-sm font-semibold text-gray-900">
                      {product.taste || "Belum diisi"}
                    </dd>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-white p-4 sm:col-span-2">
                    <dt className="text-xs text-gray-500">
                      Ukuran
                    </dt>
                    <dd className="mt-2 break-words text-sm font-semibold text-gray-900">
                      {product.size || "Belum diisi"}
                    </dd>
                  </div>
                </dl>
              </section>

              {/* Deskripsi */}
              {product.description && (
                <section className="mt-7">
                  <h2 className="text-sm font-bold text-gray-900 sm:text-base">
                    Deskripsi Produk
                  </h2>
                  <p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-gray-600">
                    {product.description}
                  </p>
                </section>
              )}

              {/* Tombol WhatsApp */}
              <div className="mt-auto pt-8">
                <button
                  type="button"
                  onClick={orderWhatsApp}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-800 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-900 focus:outline-none focus:ring-4 focus:ring-green-200"
                >
                  <FiMessageCircle size={20} />
                  Pesan melalui WhatsApp
                </button>

                <p className="mt-3 text-center text-xs leading-5 text-gray-500">
                  Konfirmasi ketersediaan produk melalui WhatsApp sebelum
                  melakukan pemesanan.
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* Kembali ke katalog */}
        <div className="mt-7 flex flex-col items-center justify-between gap-3 rounded-2xl border border-green-100 bg-white p-5 sm:flex-row sm:px-6">
          <div>
            <h2 className="font-bold text-gray-900">
              Ingin melihat pilihan lainnya?
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Jelajahi kategori produk Roti Sajiyem lainnya.
            </p>
          </div>

          <Link
            href="/produk"
            className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-green-200 px-5 py-3 text-sm font-semibold text-green-800 transition hover:bg-green-50 sm:w-auto"
          >
            <FiArrowLeft size={17} />
            Lihat Semua Produk
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-green-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
          <div className="flex items-center gap-2 text-sm font-bold text-green-800">
            <FiShoppingBag size={18} />
            Roti Sajiyem
          </div>
          <p className="text-xs leading-5 text-gray-500">
            Terima kasih telah memilih Roti Sajiyem.
          </p>
        </div>
      </footer>
    </main>
  );
}
