/**
 * Menghitung Cosine Similarity antara dua vector.
 *
 * Nilai:
 * 1   = sangat mirip
 * 0   = tidak memiliki kemiripan
 */
export function cosineSimilarity(
  vectorA: Record<string, number>,
  vectorB: Record<string, number>
): number {
  /**
   * Mengambil seluruh kata/term yang terdapat
   * pada kedua vector.
   */
  const terms = new Set([
    ...Object.keys(vectorA),
    ...Object.keys(vectorB),
  ]);

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  /**
   * Menghitung:
   *
   * Dot Product = Σ(A × B)
   */
  terms.forEach((term) => {
    const valueA = vectorA[term] || 0;
    const valueB = vectorB[term] || 0;

    dotProduct += valueA * valueB;
  });

  /**
   * Menghitung panjang/magnitude vector A.
   *
   * √Σ(A²)
   */
  Object.values(vectorA).forEach((value) => {
    magnitudeA += value * value;
  });

  magnitudeA = Math.sqrt(magnitudeA);

  /**
   * Menghitung panjang/magnitude vector B.
   *
   * √Σ(B²)
   */
  Object.values(vectorB).forEach((value) => {
    magnitudeB += value * value;
  });

  magnitudeB = Math.sqrt(magnitudeB);

  /**
   * Jika salah satu vector tidak memiliki nilai,
   * maka tidak ada kemiripan.
   */
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  /**
   * Rumus Cosine Similarity:
   *
   *        A · B
   * -----------------
   *   |A| × |B|
   */
  const similarity =
    dotProduct / (magnitudeA * magnitudeB);

  /**
   * Memastikan nilai berada pada rentang 0–1.
   */
  return Math.max(0, Math.min(1, similarity));
}

/**
 * Mengubah nilai similarity menjadi persentase.
 *
 * Contoh:
 * 0.85 → 85%
 */
export function similarityToPercentage(
  similarity: number
): number {
  return Math.round(similarity * 100);
}