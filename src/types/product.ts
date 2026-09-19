export type Product = {
  id: string;
  name: string;
  category: string;
  variant: string;
  taste: string;
  filling: string;
  size: string;
  shape: string;
  quantity: string;
  occasion: string[];
  price: number;
  description: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: unknown;
  updatedAt?: unknown;
};