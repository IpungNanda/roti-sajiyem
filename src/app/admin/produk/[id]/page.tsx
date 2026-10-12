
"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiImage,
  FiLoader,
  FiSave,
  FiTrash2,
  FiUploadCloud,
  FiX,
  FiAlertCircle,
  FiLink,
  FiRefreshCw,
} from "react-icons/fi";

import { db } from "@/lib/firebase";

const CATEGORIES = [
  "Bolu Gulung",
  "Mandarin",
  "Prol",
  "Krumpul",
  "Bolu Belah",
  "Bolu Selai",
  "Roti Kacang",
];

type ProductForm = {
  name: string;
  category: string;
  taste: string;
  size: string;
  price: string;
  description: string;
  imageUrl: string;
};

const initialForm: ProductForm = {
  name: "",
  category: "",
  taste: "Manis",
  size: "Kecil",
  price: "",
  description: "",
  imageUrl: "",
};

const inputClass =
  "mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-green-600 focus:ring-4 focus:ring-green-100";

export default function EditProdukPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProductForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageError, setImageError] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Mengambil data produk dari Firestore.
  useEffect(() => {
    let active = true;

    async function loadProduct() {
      if (!id) {
        setError("ID produk tidak ditemukan di URL.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const productRef = doc(db, "products", id);
        const snapshot = await getDoc(productRef);

        if (!active) return;

        if (!snapshot.exists()) {
          setError("Produk tidak ditemukan di Firestore.");
          return;
        }

        const data = snapshot.data();

        setForm({
          name: String(data.name ?? ""),
          category: String(data.category ?? ""),
          taste: String(data.taste ?? "Manis"),
          size: String(data.size ?? "Kecil"),
          price:
            data.price !== undefined && data.price !== null
              ? String(data.price)
              : "",
          description: String(data.description ?? ""),
          imageUrl: String(data.imageUrl ?? ""),
        });
      } catch (err) {
        console.error("Gagal memuat produk:", err);

        if (active) {
          setError(
            "Gagal mengambil data produk. Periksa koneksi Firebase dan Firestore Rules."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProduct();

    return () => {
      active = false;
    };
  }, [id]);

  function handleChange(
    field: keyof ProductForm,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  }

  // Mengunggah gambar ke Cloudinary.
  async function handleImageUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    // Izinkan memilih file yang sama kembali.
    event.target.value = "";

    if (!file) return;

    setError("");
    setSuccess("");
    setImageError("");

    if (!file.type.startsWith("image/")) {
      setImageError("File harus berupa gambar.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError("Ukuran gambar maksimal 5 MB.");
      return;
    }

    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset =
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      setImageError(
        "Konfigurasi Cloudinary belum lengkap. Periksa file .env.local."
      );
      return;
    }

    try {
      setUploading(true);

      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("upload_preset", uploadPreset);
      uploadData.append("folder", "roti-sajiyem/products");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: uploadData,
        }
      );

      const result = await response.json();

      if (!response.ok || !result.secure_url) {
        console.error("Cloudinary upload error:", result);

        throw new Error(
          result.error?.message ||
            "Gagal mengunggah gambar ke Cloudinary."
        );
      }

      // URL baru akan tersimpan ke Firestore ketika tombol
      // Simpan Perubahan ditekan.
      setForm((previous) => ({
        ...previous,
        imageUrl: result.secure_url,
      }));

      setSuccess(
        "Gambar berhasil diunggah. Tekan Simpan Perubahan untuk menyimpannya."
      );
    } catch (err) {
      console.error("Gagal mengunggah gambar:", err);

      setImageError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan ketika mengunggah gambar."
      );
    } finally {
      setUploading(false);
    }
  }

  function removeImage() {
    setForm((previous) => ({
      ...previous,
      imageUrl: "",
    }));

    setImageError("");
    setError("");
    setSuccess(
      "Gambar dihapus dari formulir. Tekan Simpan Perubahan untuk menerapkan perubahan."
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!id) {
      setError("ID produk tidak tersedia.");
      return;
    }

    if (uploading) {
      setError("Tunggu hingga proses upload gambar selesai.");
      return;
    }

    if (
      !form.name.trim() ||
      !form.category ||
      !form.taste ||
      !form.size
    ) {
      setError(
        "Nama, kategori, rasa, dan ukuran wajib diisi."
      );
      return;
    }

    const price = Number(form.price);

    if (
      form.price.trim() === "" ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      setError("Harga harus berupa angka lebih dari 0.");
      return;
    }

    try {
      setSaving(true);

      const productRef = doc(db, "products", id);
      const snapshot = await getDoc(productRef);

      if (!snapshot.exists()) {
        setError("Produk tidak ditemukan di Firestore.");
        return;
      }

      await updateDoc(productRef, {
        name: form.name.trim(),
        category: form.category,
        taste: form.taste,
        size: form.size,
        price,
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
        updatedAt: serverTimestamp(),
      });

      setSuccess("Produk berhasil diperbarui.");

      router.push("/admin/produk");
      router.refresh();
    } catch (err) {
      console.error("Gagal memperbarui produk:", err);

      setError(
        "Gagal menyimpan perubahan. Periksa koneksi Firebase dan Firestore Rules."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f8f4] px-4">
        <div className="text-center">
          <FiLoader className="mx-auto animate-spin text-3xl text-green-700" />
          <p className="mt-4 text-sm font-medium text-stone-600">
            Memuat data produk...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f8f4] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        {/* Navigasi */}
        <button
          type="button"
          onClick={() => router.push("/admin/produk")}
          className="mb-6 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-green-800 transition hover:bg-green-50"
        >
          <FiArrowLeft />
          Kembali ke Daftar Produk
        </button>

        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">
            Manajemen Produk
          </p>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl">
            Edit Produk
          </h1>

          <p className="mt-2 text-sm leading-6 text-stone-500">
            Perbarui informasi, harga, deskripsi, dan gambar produk
            Roti Sajiyem.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid items-start gap-6 lg:grid-cols-[1fr_0.85fr]">
            {/* Informasi produk */}
            <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
              <div className="border-b border-stone-100 px-5 py-5 sm:px-7">
                <h2 className="font-bold text-stone-900">
                  Informasi Produk
                </h2>
                <p className="mt-1 text-xs leading-5 text-stone-500">
                  Lengkapi data produk yang ingin diperbarui.
                </p>
              </div>

              <div className="space-y-5 p-5 sm:p-7">
                <div>
                  <label
                    htmlFor="name"
                    className="text-sm font-semibold text-stone-700"
                  >
                    Nama Produk <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    className={inputClass}
                    value={form.name}
                    onChange={(e) =>
                      handleChange("name", e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="text-sm font-semibold text-stone-700"
                  >
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    className={inputClass}
                    value={form.category}
                    onChange={(e) =>
                      handleChange("category", e.target.value)
                    }
                    required
                  >
                    <option value="">Pilih kategori</option>

                    {CATEGORIES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}

                    {!CATEGORIES.includes(form.category) &&
                      form.category && (
                        <option value={form.category}>
                          {form.category}
                        </option>
                      )}
                  </select>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="taste"
                      className="text-sm font-semibold text-stone-700"
                    >
                      Rasa <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="taste"
                      className={inputClass}
                      value={form.taste}
                      onChange={(e) =>
                        handleChange("taste", e.target.value)
                      }
                      required
                    >
                      <option value="Manis">Manis</option>
                      <option value="Gurih">Gurih</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="size"
                      className="text-sm font-semibold text-stone-700"
                    >
                      Ukuran <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="size"
                      className={inputClass}
                      value={form.size}
                      onChange={(e) =>
                        handleChange("size", e.target.value)
                      }
                      required
                    >
                      <option value="Kecil">Kecil</option>
                      <option value="Besar">Besar</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="price"
                    className="text-sm font-semibold text-stone-700"
                  >
                    Harga (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="price"
                    type="number"
                    min="1"
                    step="1"
                    className={inputClass}
                    value={form.price}
                    onChange={(e) =>
                      handleChange("price", e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="text-sm font-semibold text-stone-700"
                  >
                    Deskripsi Produk
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    className={inputClass}
                    value={form.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    placeholder="Tuliskan deskripsi produk..."
                  />
                </div>
              </div>
            </section>

            {/* Pengaturan gambar */}
            <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
              <div className="border-b border-stone-100 px-5 py-5 sm:px-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-xl text-green-800">
                    <FiImage />
                  </div>
                  <div>
                    <h2 className="font-bold text-stone-900">
                      Gambar Produk
                    </h2>
                    <p className="mt-1 text-xs text-stone-500">
                      Ganti gambar lama atau unggah gambar baru.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-7">
                {/* Preview */}
                <div className="relative flex min-h-56 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-stone-300 bg-stone-50 sm:min-h-72">
                  {form.imageUrl ? (
                    <>
                      <img
                        src={form.imageUrl}
                        alt={`Pratinjau ${form.name || "produk"}`}
                        className="absolute inset-0 h-full w-full object-contain p-3"
                        onError={() =>
                          setImageError(
                            "Gambar tidak dapat ditampilkan. Periksa URL atau coba unggah ulang."
                          )
                        }
                        onLoad={() => setImageError("")}
                      />

                      <button
                        type="button"
                        onClick={removeImage}
                        disabled={uploading || saving}
                        aria-label="Hapus gambar"
                        className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-white/95 text-red-600 shadow-sm transition hover:bg-red-50 disabled:opacity-50"
                      >
                        <FiTrash2 />
                      </button>
                    </>
                  ) : (
                    <div className="px-6 py-10 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-3xl text-green-800">
                        <FiImage />
                      </div>
                      <p className="mt-4 text-sm font-bold text-stone-700">
                        Belum ada gambar
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        Unggah gambar untuk melihat pratinjau.
                      </p>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || saving}
                  className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading ? (
                    <>
                      <FiLoader className="animate-spin text-lg" />
                      Mengunggah gambar...
                    </>
                  ) : (
                    <>
                      <FiUploadCloud className="text-lg" />
                      {form.imageUrl ? "Ganti Gambar" : "Upload Gambar"}
                    </>
                  )}
                </button>

                <p className="mt-3 text-center text-xs leading-5 text-stone-500">
                  Format gambar mengikuti dukungan Cloudinary.
                  Ukuran maksimal file 5 MB.
                </p>

                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-stone-200" />
                  <span className="text-xs font-medium text-stone-400">
                    ATAU GUNAKAN URL
                  </span>
                  <div className="h-px flex-1 bg-stone-200" />
                </div>

                <button
                  type="button"
                  onClick={() => setShowUrlInput((current) => !current)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-green-800 transition hover:text-green-950"
                >
                  <FiLink />
                  {showUrlInput ? "Tutup input URL" : "Masukkan URL gambar"}
                </button>

                {showUrlInput && (
                  <div className="mt-3">
                    <label
                      htmlFor="imageUrl"
                      className="text-sm font-semibold text-stone-700"
                    >
                      URL Gambar
                    </label>
                    <input
                      id="imageUrl"
                      type="url"
                      className={inputClass}
                      value={form.imageUrl}
                      onChange={(e) =>
                        handleChange("imageUrl", e.target.value)
                      }
                      placeholder="https://..."
                    />
                    <p className="mt-2 text-xs leading-5 text-stone-500">
                      Masukkan URL gambar yang dapat diakses secara publik.
                    </p>
                  </div>
                )}

                {imageError && (
                  <div
                    role="alert"
                    className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700"
                  >
                    <FiAlertCircle className="mt-0.5 shrink-0" />
                    <span>{imageError}</span>
                  </div>
                )}

                {success && (
                  <div
                    role="status"
                    className="mt-4 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-xs leading-5 text-green-800"
                  >
                    <FiCheckCircle className="mt-0.5 shrink-0" />
                    <span>{success}</span>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Pesan dan tombol simpan */}
          {error && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
            >
              <FiAlertCircle className="mt-1 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 rounded-2xl border border-stone-200 bg-white p-4 sm:flex-row sm:justify-end sm:p-5">
            <button
              type="button"
              onClick={() => router.push("/admin/produk")}
              disabled={saving || uploading}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-stone-200 px-5 py-3 text-sm font-bold text-stone-600 transition hover:bg-stone-50 disabled:opacity-50"
            >
              <FiX />
              Batal
            </button>

            <button
              type="submit"
              disabled={saving || uploading || !id}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-green-800 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <FiLoader className="animate-spin" />
                  Menyimpan perubahan...
                </>
              ) : (
                <>
                  <FiSave />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>

          <p className="mt-4 break-all text-center text-xs text-stone-400">
            ID produk: {id}
          </p>
        </form>
      </div>
    </main>
  );
}
