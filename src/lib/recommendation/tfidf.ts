/**
 * TF-IDF sederhana untuk dokumen teks produk dan profil preferensi.
 * Tidak membutuhkan library tambahan.
 */

function tokenize(text: string): string[] {
  return text
    .toLocaleLowerCase("id-ID")
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function calculateTfIdf(documents: string[]): number[][] {
  if (documents.length === 0) return [];

  const tokenized = documents.map(tokenize);
  const vocabulary = Array.from(
    new Set(tokenized.flat())
  ).sort();

  if (vocabulary.length === 0) {
    return documents.map(() => []);
  }

  const documentFrequency = new Map<string, number>();
  for (const tokens of tokenized) {
    for (const token of new Set(tokens)) {
      documentFrequency.set(
        token,
        (documentFrequency.get(token) ?? 0) + 1
      );
    }
  }

  return tokenized.map((tokens) => {
    const counts = new Map<string, number>();
    for (const token of tokens) {
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }

    const totalTokens = tokens.length || 1;

    return vocabulary.map((term) => {
      const tf = (counts.get(term) ?? 0) / totalTokens;
      const df = documentFrequency.get(term) ?? 0;
      const idf = Math.log((1 + documents.length) / (1 + df)) + 1;
      return tf * idf;
    });
  });
}
