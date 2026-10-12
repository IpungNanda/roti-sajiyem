export type Product = {
  id: string;
  name: string;
  category: string;
  taste: string;
  size: string;
  price: number;

  // Atribut pendukung tampilan aplikasi
  variant?: string;
  filling?: string;
  shape?: string;
  quantity?: string;
  occasion?: string[];
  description?: string;
  imageUrl?: string;

  isActive: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type TFIDFVector = Record<string, number>;