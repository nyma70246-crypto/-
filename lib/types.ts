/**
 * Core data types for Workers Connect app
 */

// User roles
export type UserRole = 'worker' | 'customer' | 'admin';

// User profile
export interface User {
  id: string;
  openId: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Worker profile (extends User)
export interface WorkerProfile extends User {
  role: 'worker';
  profession: string;
  bio?: string;
  rating: number;
  reviewCount: number;
  hourlyRate?: number;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  portfolio: PortfolioItem[];
  isAvailable: boolean;
  tags: string[];
}

// Customer profile (extends User)
export interface CustomerProfile extends User {
  role: 'customer';
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  savedWorkers: string[];
}

// Portfolio item for workers
export interface PortfolioItem {
  id: string;
  workerId: string;
  title: string;
  description?: string;
  images: string[];
  createdAt: Date;
}

// Message
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  images?: string[];
  createdAt: Date;
  isRead: boolean;
}

// Conversation
export interface Conversation {
  id: string;
  participantIds: [string, string];
  lastMessage?: Message;
  lastMessageAt: Date;
  createdAt: Date;
}

// Rating/Review
export interface Rating {
  id: string;
  workerId: string;
  customerId: string;
  score: number; // 1-5
  comment?: string;
  createdAt: Date;
}

// Advertisement
export interface Advertisement {
  id: string;
  title: string;
  description: string;
  image?: string;
  targetProfessions: string[];
  targetLocation?: {
    latitude: number;
    longitude: number;
    radius: number; // in km
  };
  link?: string;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

// Search filters
export interface SearchFilters {
  profession?: string;
  maxDistance?: number;
  minRating?: number;
  maxPrice?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  isAvailable?: boolean;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
