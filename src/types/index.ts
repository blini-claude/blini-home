export type SourceStore = "shporta" | "tregu" | "benny";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "delivering"
  | "delivered"
  | "cancelled";

export type SyncStatus = "running" | "completed" | "failed";

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  title: string;
  thumbnail: string | null;
  slug: string;
}

export interface CheckoutData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  city: string;
  address: string;
  notes?: string;
}
