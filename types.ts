export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password?: string; // In a real app, never store plain text
}

export enum ProductCategory {
  CAKES = 'Cakes',
  COOKIES = 'Cookies',
  PASTRIES = 'Pastries'
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  image: string;
  stock: number;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  threshold: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export enum OrderStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  BAKING = 'Baking',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export enum PaymentMethod {
  COD = 'Cash on Delivery',
  GCASH = 'GCash'
}

export enum DeliveryMethod {
  PICKUP = 'Pickup',
  DELIVERY = 'Delivery'
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentProof?: string; // URL or base64 placeholder
  deliveryMethod: DeliveryMethod;
  scheduledDate: string;
  scheduledTime: string;
  createdAt: string;
  isCustomInquiry?: boolean;
  customDetails?: {
    size: string;
    notes: string;
    referenceImage?: string;
  };
}