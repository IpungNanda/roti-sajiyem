import { Product } from "@/types/product";

/**
 * Mengubah teks menjadi token/kata.
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Mengelompokkan harga berdasarkan range harga
 * yang sesuai dengan daftar harga Roti Sajiyem.
 *
 * Range:
 * Rp12.000 - Rp25.000
 * Rp26.000 - Rp50.000
 * Rp51.000 - Rp100.000
 * Rp101.000 - Rp130.000
 * Di atas Rp130.000
 */
export function getPriceCategory(
  price: number
): string {
  if (price >= 12000 && price <= 25000) {
    return "harga_12k_25k";
  }

  if (price >= 26000 && price <= 50000) {
    return "harga_26k_50k";
  }

  if (price >= 51000 && price <= 100000) {
    return "harga_51k_100k";
  }

  if (price >= 101000 && price <= 130000) {
    return "harga_101k_130k";
  }

  if (price > 130000) {
    return "harga_di_atas_130k";
  }

  /**
   * Untuk data yang berada di luar
   * range harga produk saat ini.
   */
  return "harga_lainnya";
}

/**
 * Membuat dokumen teks dari atribut produk.
 *
 * Bobot:
 *
 * Kategori = 3x
 * Varian   = 3x
 *
 * Atribut pendukung:
 * Rasa
 * Isian
 * Ukuran
 * Bentuk
 * Jumlah
 * Acara
 * Harga
 */
export function createProductDocument(
  product: Product
): string {
  /**
   * Kategori dan varian diberi bobot lebih tinggi
   * karena menjadi karakteristik utama produk.
   */
  const category =
    `${product.category || ""} `.repeat(3);

  const variant =
    `${product.variant || ""} `.repeat(3);

  /**
   * Atribut pendukung.
   */
  const taste = product.taste || "";
  const filling = product.filling || "";
  const size = product.size || "";
  const shape = product.shape || "";
  const quantity = product.quantity || "";

  /**
   * Data acara.
   *
   * Contoh:
   * ["Hajatan", "Arisan", "Acara Keluarga"]
   */
  const occasion = Array.isArray(product.occasion)
    ? product.occasion.join(" ")
    : product.occasion || "";

  /**
   * Mengubah harga menjadi kategori.
   */
  const priceCategory = getPriceCategory(
    Number(product.price) || 0
  );

  /**
   * Seluruh atribut digabungkan menjadi
   * satu dokumen untuk proses TF-IDF.
   */
  return `
    ${category}
    ${variant}
    ${taste}
    ${filling}
    ${size}
    ${shape}
    ${quantity}
    ${occasion}
    ${priceCategory}
  `;
}

/**
 * Menghitung Term Frequency (TF).
 *
 * TF = jumlah kemunculan term /
 *      jumlah seluruh term dalam dokumen.
 */
function calculateTF(
  tokens: string[]
): Record<string, number> {
  const termFrequency: Record<string, number> = {};

  if (tokens.length === 0) {
    return termFrequency;
  }

  tokens.forEach((token) => {
    termFrequency[token] =
      (termFrequency[token] || 0) + 1;
  });

  const totalTerms = tokens.length;

  Object.keys(termFrequency).forEach((term) => {
    termFrequency[term] =
      termFrequency[term] / totalTerms;
  });

  return termFrequency;
}

/**
 * Menghitung Inverse Document Frequency (IDF).
 *
 * IDF = log(N / (1 + df)) + 1
 */
function calculateIDF(
  documents: string[][]
): Record<string, number> {
  const idf: Record<string, number> = {};

  const totalDocuments = documents.length;

  if (totalDocuments === 0) {
    return idf;
  }

  /**
   * Membuat vocabulary dari seluruh dokumen.
   */
  const vocabulary = new Set<string>();

  documents.forEach((document) => {
    document.forEach((term) => {
      vocabulary.add(term);
    });
  });

  /**
   * Menghitung IDF setiap term.
   */
  vocabulary.forEach((term) => {
    let documentFrequency = 0;

    documents.forEach((document) => {
      if (document.includes(term)) {
        documentFrequency++;
      }
    });

    idf[term] =
      Math.log(
        totalDocuments /
          (1 + documentFrequency)
      ) + 1;
  });

  return idf;
}

/**
 * Menghitung TF-IDF untuk seluruh produk.
 */
export function calculateTFIDF(
  products: Product[]
): Record<string, number>[] {
  if (products.length === 0) {
    return [];
  }

  /**
   * Membuat dokumen untuk setiap produk.
   */
  const documents = products.map((product) =>
    tokenize(
      createProductDocument(product)
    )
  );

  /**
   * Menghitung IDF seluruh vocabulary.
   */
  const idf = calculateIDF(documents);

  /**
   * Menghasilkan vector TF-IDF.
   */
  return documents.map((document) => {
    const tf = calculateTF(document);

    const tfidf: Record<string, number> = {};

    Object.keys(idf).forEach((term) => {
      const termFrequency =
        tf[term] || 0;

      tfidf[term] =
        termFrequency * idf[term];
    });

    return tfidf;
  });
}

/**
 * Membuat TF-IDF vector untuk satu produk.
 */
export function calculateProductTFIDF(
  product: Product,
  products: Product[]
): Record<string, number> {
  const productExists = products.some(
    (item) => item.id === product.id
  );

  const allProducts = productExists
    ? products
    : [...products, product];

  const vectors = calculateTFIDF(
    allProducts
  );

  const index = allProducts.findIndex(
    (item) => item.id === product.id
  );

  return vectors[index] || {};
}