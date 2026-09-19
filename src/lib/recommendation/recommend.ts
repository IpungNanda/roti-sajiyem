import { Product } from "@/types/product";
import { calculateTFIDF } from "./tfidf";
import { cosineSimilarity } from "./cosineSimilarity";

export type RecommendationPreferences = {
  occasion?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
};

export type RecommendationResult = {
  product: Product;
  similarity: number;
};

/**
 * Memeriksa kesesuaian produk dengan acara
 * yang dipilih pelanggan.
 */
function matchesOccasion(
  product: Product,
  occasion?: string
): boolean {
  if (!occasion) {
    return false;
  }

  if (
    !product.occasion ||
    product.occasion.length === 0
  ) {
    return false;
  }

  return product.occasion.some(
    (item) =>
      item.toLowerCase().trim() ===
      occasion.toLowerCase().trim()
  );
}

/**
 * Memeriksa apakah harga produk berada
 * dalam range harga yang dipilih pelanggan.
 */
function matchesPrice(
  product: Product,
  minPrice?: number,
  maxPrice?: number
): boolean {
  if (
    minPrice === undefined &&
    maxPrice === undefined
  ) {
    return false;
  }

  const price = Number(product.price) || 0;

  if (
    minPrice !== undefined &&
    price < minPrice
  ) {
    return false;
  }

  if (
    maxPrice !== undefined &&
    price > maxPrice
  ) {
    return false;
  }

  return true;
}

/**
 * Memeriksa kesesuaian ukuran produk.
 */
function matchesSize(
  product: Product,
  size?: string
): boolean {
  if (
    !size ||
    size === "Semua Ukuran"
  ) {
    return false;
  }

  if (!product.size) {
    return false;
  }

  const productSize =
    product.size
      .toLowerCase()
      .replace(/\s/g, "");

  const selectedSize =
    size
      .toLowerCase()
      .replace(/\s/g, "");

  return productSize.includes(
    selectedSize
  );
}

/**
 * Menghasilkan rekomendasi produk
 * menggunakan metode Content-Based Filtering.
 *
 * Kategori digunakan sebagai preferensi utama.
 *
 * Metode:
 *
 * 1. Mengambil produk aktif.
 * 2. Membentuk profil kategori.
 * 3. Menghitung TF-IDF.
 * 4. Menghitung Cosine Similarity.
 * 5. Menghitung preferensi tambahan:
 *    - Acara
 *    - Harga
 *    - Ukuran
 * 6. Menggabungkan nilai similarity
 *    dengan preferensi pengguna.
 * 7. Mengurutkan produk berdasarkan
 *    skor rekomendasi tertinggi.
 */
export function getRecommendations(
  selectedCategory: string,
  products: Product[],
  preferences: RecommendationPreferences = {},
  limit: number = 5
): RecommendationResult[] {
  /**
   * Validasi kategori.
   */
  if (!selectedCategory?.trim()) {
    return [];
  }

  /**
   * Hanya produk aktif yang digunakan
   * dalam sistem rekomendasi.
   */
  const activeProducts =
    products.filter(
      (product) => product.isActive
    );

  /**
   * Tidak dapat melakukan rekomendasi
   * jika tidak terdapat produk aktif.
   */
  if (activeProducts.length === 0) {
    return [];
  }

  /**
   * Membentuk profil kategori.
   *
   * Kategori menjadi preferensi utama
   * pengguna.
   */
  const categoryProfile: Product = {
    id: "__category_profile__",
    name: "",
    category: selectedCategory,
    variant: "",
    taste: "",
    filling: "",
    size: "",
    shape: "",
    quantity: "",
    occasion: [],
    price: 0,
    description: "",
    imageUrl: "",
    isActive: true,
    createdAt: null,
  };

  /**
   * Menggabungkan produk aktif dengan
   * profil kategori.
   */
  const allProducts = [
    ...activeProducts,
    categoryProfile,
  ];

  /**
   * Menghitung TF-IDF seluruh produk.
   */
  const tfidfVectors =
    calculateTFIDF(allProducts);

  /**
   * Profil kategori berada pada posisi
   * terakhir dalam array.
   */
  const categoryIndex =
    allProducts.length - 1;

  /**
   * Vector TF-IDF dari kategori pilihan.
   */
  const categoryVector =
    tfidfVectors[categoryIndex];

  /**
   * Menghitung rekomendasi untuk setiap
   * produk aktif.
   */
  const recommendations =
    activeProducts.map(
      (product, index) => {
        /**
         * Menghitung Cosine Similarity
         * antara kategori pilihan dengan
         * produk.
         */
        const similarity =
          cosineSimilarity(
            categoryVector,
            tfidfVectors[index]
          );

        /**
         * Menghitung skor preferensi tambahan.
         *
         * Acara = 10%
         * Harga = 10%
         * Ukuran = 10%
         */
        let preferenceScore = 0;

        /**
         * Preferensi acara.
         */
        if (
          preferences.occasion &&
          matchesOccasion(
            product,
            preferences.occasion
          )
        ) {
          preferenceScore += 0.1;
        }

        /**
         * Preferensi harga.
         */
        if (
          (
            preferences.minPrice !== undefined ||
            preferences.maxPrice !== undefined
          ) &&
          matchesPrice(
            product,
            preferences.minPrice,
            preferences.maxPrice
          )
        ) {
          preferenceScore += 0.1;
        }

        /**
         * Preferensi ukuran.
         */
        if (
          preferences.size &&
          preferences.size !== "Semua Ukuran" &&
          matchesSize(
            product,
            preferences.size
          )
        ) {
          preferenceScore += 0.1;
        }

        /**
         * Similarity menjadi dasar utama
         * rekomendasi dengan bobot 70%.
         *
         * Preferensi tambahan memiliki
         * bobot maksimal 30%.
         */
        const finalScore =
          similarity * 0.7 +
          preferenceScore;

        return {
          product,
          similarity: Math.min(
            finalScore,
            1
          ),
        };
      }
    );

  /**
   * Mengurutkan berdasarkan skor
   * rekomendasi tertinggi.
   */
  recommendations.sort(
    (a, b) =>
      b.similarity -
      a.similarity
  );

  /**
   * Mengambil sejumlah produk sesuai
   * dengan batas rekomendasi.
   */
  return recommendations.slice(
    0,
    limit
  );
}