
// Types pour l'authentification NextAuth
import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role?: string;
      phone?: string;
      address?: string;
      city?: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role?: string;
    phone?: string;
    address?: string;
    city?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
    phone?: string;
    address?: string;
    city?: string;
  }
}

// Types pour les produits
export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  images: string[];
  price: number;
  brand?: string;
  model?: string;
  power?: string;
  weight?: string;
  dimensions?: string;
  features: string[];
  specifications?: any;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  category: Category;
}

// Types pour les catégories
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Types pour les commandes
export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  notes?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPostalCode?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  orderItems: OrderItem[];
}

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  orderId: string;
  productId: string;
  product: Product;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

// Types pour les utilisateurs
export interface User {
  id: string;
  email: string;
  password?: string;
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  image?: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Types pour le panier
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  brand?: string;
  model?: string;
}
