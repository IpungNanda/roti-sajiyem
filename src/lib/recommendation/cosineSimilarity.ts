/**
 * Menghitung Cosine Similarity dua vektor.
 * Nilai skor dibatasi pada rentang 0 sampai 1.
 */
export function cosineSimilarity(
  vectorA: number[],
  vectorB: number[]
): number {
  if (vectorA.length === 0 || vectorA.length !== vectorB.length) {
    return 0;
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i += 1) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }

  const denominator = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
  if (denominator === 0) return 0;

  const score = dotProduct / denominator;
  return Math.max(0, Math.min(1, score));
}

/**
 * Mengubah skor similarity 0–1 menjadi angka persentase 0–100.
 * Contoh: 0.734 -> 73.
 */
export function similarityToPercentage(similarity: number): number {
  if (!Number.isFinite(similarity)) return 0;
  const bounded = Math.max(0, Math.min(1, similarity));
  return Math.round(bounded * 100);
}
