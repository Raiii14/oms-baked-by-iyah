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
  lastNameUpdate?: number; // Timestamp of last name update
  phoneNumber?: string;
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
  adminOnly?: boolean;
  bestSeller?: boolean;
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
  customerEmail?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  isCustomInquiry?: boolean;
  customDetails?: {
    size: string;
    servings: string;
    flavor: string;
    cakeMessage: string;
    color: string;
    toppers: TopperType[];
    toyTopperDetail: string;
    fondantTopperDetail: string;
    toppersOther: string;
    notes: string;
    referenceImage?: string;
    inspirationCake: string;
    inspirationElements: string;
  };
}

export interface UserNotification {
  id: string;
  userId: string;
  message: string;
  orderId: string;
  orderStatus: OrderStatus;
  isRead: boolean;
  createdAt: string;
}

export interface PastCake {
  name: string;
  image: string;
}

export const TOPPER_OPTIONS = ['Toy Topper', 'Fondant Topper', 'Others'] as const;
export type TopperType = typeof TOPPER_OPTIONS[number];

export interface FormState {
  name: string;
  email: string;
  size: string;
  sizeOther: string;
  date: string;
  servings: string;
  flavor: string;
  cakeMessage: string;
  color: string;
  toppers: TopperType[];
  toyTopperDetail: string;
  fondantTopperDetail: string;
  toppersOther: string;
  notes: string;
  image: File | null;
  inspirationCake: string;
  inspirationElements: string;
}