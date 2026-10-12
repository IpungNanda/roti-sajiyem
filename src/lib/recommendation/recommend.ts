
import type { Product } from "@/types/product";
import { calculateTfIdf } from "./tfidf";
import { cosineSimilarity } from "./cosineSimilarity";

export type RecommendationFilters = {
  taste?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
};

export type RecommendationResult = {
  product: Product;
  similarity: number;
};

function normalize(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("id-ID");
}

function isProductActive(product: Product): boolean {
  const status = (
    product as Product & { isActive?: boolean }
  ).isActive;

  // Produk lama tanpa isActive dianggap aktif.
  return status !== false;
}

function productText(product: Product): string {
  return [
    product.name,
    product.category,
    product.taste,
    product.size,
  ]
    .map(normalize)
    .filter(Boolean)
    .join(" ");
}

function isValidPrice(value: unknown): boolean {
  const price = Number(value);
  return Number.isFinite(price) && price > 0;
}

export function getRecommendations(
  category: string,
  products: Product[],
  filters: RecommendationFilters = {},
  limit = 5
): RecommendationResult[] {
  // Validasi input utama.
  if (!category.trim() || !Array.isArray(products)) {
    return [];
  }

  const normalizedCategory = normalize(category);

  // Tahap 1: kategori wajib dan status produk.
  // Tidak pernah mengambil produk dari kategori lain.
  const categoryProducts = products.filter(
    (product) =>
      isProductActive(product) &&
      normalize(product.category) === normalizedCategory &&
      isValidPrice(product.price)
  );

  if (categoryProducts.length === 0) {
    console.warn(
      "[Rekomendasi] Produk tidak ditemukan pada kategori:",
      category
    );

    return [];
  }

  // Tahap 2: filter preferensi tambahan.
  const filteredProducts = categoryProducts.filter((product) => {
    if (
      filters.taste?.trim() &&
      normalize(product.taste) !== normalize(filters.taste)
    ) {
      return false;
    }

    if (
      filters.size?.trim() &&
      normalize(product.size) !== normalize(filters.size)
    ) {
      return false;
    }

    const price = Number(product.price);

    if (
      filters.minPrice !== undefined &&
      price < filters.minPrice
    ) {
      return false;
    }

    if (
      filters.maxPrice !== undefined &&
      price > filters.maxPrice
    ) {
      return false;
    }

    return true;
  });

  if (filteredProducts.length === 0) {
    console.warn(
      "[Rekomendasi] Tidak ada produk yang memenuhi filter.",
      {
        category,
        filters,
        jumlahProdukKategori: categoryProducts.length,
      }
    );

    return [];
  }

  // Tahap 3: membentuk profil preferensi pengguna.
  // Harga dipakai sebagai filter numerik, bukan token TF-IDF.
  const preferenceText = [
    category,
    filters.taste ?? "",
    filters.size ?? "",
  ]
    .map(normalize)
    .filter(Boolean)
    .join(" ");

  // Dokumen pertama adalah profil preferensi.
  // Dokumen berikutnya adalah deskripsi tiap produk.
  const documents = [
    preferenceText,
    ...filteredProducts.map(productText),
  ];

  // Tahap 4: pembobotan TF-IDF.
  const vectors = calculateTfIdf(documents);

  if (
    !Array.isArray(vectors) ||
    vectors.length !== documents.length ||
    !vectors.every(
      (vector) =>
        Array.isArray(vector) &&
        vector.every((value) => Number.isFinite(value))
    )
  ) {
    console.error(
      "[Rekomendasi] Hasil vektor TF-IDF tidak valid."
    );

    return [];
  }

  const preferenceVector = vectors[0];

  // Tahap 5: Cosine Similarity dan pemeringkatan.
  const rankedProducts = filteredProducts.map(
    (product, index): RecommendationResult => {
      const rawSimilarity = cosineSimilarity(
        preferenceVector,
        vectors[index + 1]
      );

      // Menjaga skor berada dalam rentang 0 sampai 1.
      const similarity = Number.isFinite(rawSimilarity)
        ? Math.min(1, Math.max(0, rawSimilarity))
        : 0;

      return {
        product,
        similarity,
      };
    }
  );

  rankedProducts.sort((a, b) => {
    if (b.similarity !== a.similarity) {
      return b.similarity - a.similarity;
    }

    // Urutan stabil apabila skor sama.
    return a.product.name.localeCompare(
      b.product.name,
      "id-ID"
    );
  });

  // Tahap 6: mengambil sejumlah hasil yang diminta.
  const safeLimit = Number.isFinite(limit)
    ? Math.max(1, Math.floor(limit))
    : 5;

  return rankedProducts.slice(0, safeLimit);
}
