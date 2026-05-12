export type AdPlacement = "SIDEBAR" | "TOP_BANNER" | "FEED";
//   | "FOOTER";
export type AdSource = "ADMIN" | "USER";
export type AdStatus =
  | "PENDING_PAYMENT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export interface AdResponse {
  id: string;
  createdBy: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  targetUrl?: string;
  placement: AdPlacement;
  source: AdSource;
  status: AdStatus;
  startsAt?: string;
  endsAt?: string;
  isActive: boolean;
  reviewedAt?: string;
  rejectionNotes?: string;
  createdAt: string;
}

export interface AdListResponse {
  data: AdResponse[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface AdPricingResponse {
  id: string;
  placement: AdPlacement;
  durationDays: number;
  price: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdStatsResponse {
  totalClicks: number;
  clicksByDay: { date: string; count: number }[];
}

export interface AdsQuery {
  cursor?: string;
  limit?: number;
  isActive?: boolean;
  placement?: AdPlacement | "";
  source?: AdSource | "";
  status?: AdStatus | "";
}

export const AD_PLACEMENT_LABELS: Record<AdPlacement, string> = {
  SIDEBAR: "Side Banner",
  TOP_BANNER: "Top Banner",
  FEED: "Feed",
  // FOOTER: "Footer",
};

export const AD_STATUS_LABELS: Record<AdStatus, string> = {
  PENDING_PAYMENT: "Pending Payment",
  PENDING_REVIEW: "Pending Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};
