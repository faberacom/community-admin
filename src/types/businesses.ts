import { PaginatedResponse } from "./api";

export interface AdminBusinessOwner {
  id: string;
  username: string;
}

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export interface AdminBusinessPayment {
  id: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
  paymentType: string;
  createdAt: string;
}

export interface AdminBusiness {
  id: string;
  name: string;
  category: string;
  city?: string;
  country?: string;
  isVerified: boolean;
  isFeatured: boolean;
  isDeleted: boolean;
  createdAt: string;
  owner: AdminBusinessOwner;
  followerCount: number;
  postCount: number;
}

export interface AdminBusinessDetail extends AdminBusiness {
  description: string;
  state?: string;
  phone: string;
  email: string;
  websiteUrl?: string;
  paymentCount: number;
  recentPayments: AdminBusinessPayment[];
}

export interface AdminBusinessToggleResponse {
  id: string;
  name: string;
  isVerified: boolean;
  isFeatured: boolean;
}

export type AdminBusinessListResponse = PaginatedResponse<AdminBusiness>;

export interface BusinessesQuery {
  cursor?: string;
  limit?: number;
  search?: string;
  category?: string;
  isVerified?: boolean;
}
