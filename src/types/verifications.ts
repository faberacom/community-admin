export type VerificationDocumentType =
  | "BUSINESS_REGISTRATION"
  | "BUSINESS_LICENSE"
  | "UTILITY_BILL"
  | "TAX_DOCUMENT"
  | "GOVERNMENT_ID"
  | "OTHER";

export type VerificationStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED";

export interface AdminVerificationItem {
  id: string;
  status: VerificationStatus;
  createdAt: string;
  documentCount: number;
  business: {
    id: string;
    name: string;
    isVerified: boolean;
  };
  submittedBy: {
    id: string;
    username: string;
  };
}

export interface AdminVerificationDocument {
  id: string;
  type: VerificationDocumentType;
  viewUrl: string;
}

export interface AdminVerificationDetail extends AdminVerificationItem {
  notes?: string;
  reviewedAt?: string;
  business: AdminVerificationItem["business"] & {
    category?: string;
    city?: string;
    country?: string;
    phone?: string;
    email?: string;
  };
  documents: AdminVerificationDocument[];
}

export interface AdminVerificationListResponse {
  data: AdminVerificationItem[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface VerificationsQuery {
  cursor?: string;
  limit?: number;
  status?: VerificationStatus | "";
  search?: string;
}

export const VERIFICATION_DOCUMENT_TYPE_LABELS: Record<
  VerificationDocumentType,
  string
> = {
  BUSINESS_REGISTRATION: "Business Registration",
  BUSINESS_LICENSE: "Business License",
  UTILITY_BILL: "Utility Bill",
  TAX_DOCUMENT: "Tax Document",
  GOVERNMENT_ID: "Government ID",
  OTHER: "Other Document",
};
