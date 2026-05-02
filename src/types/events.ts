export type EventCategory =
  | "MEETUP"
  | "WORKSHOP"
  | "WEBINAR"
  | "CONFERENCE"
  | "PROMOTION"
  | "ANNOUNCEMENT"
  | "SOCIAL"
  | "FUNDRAISER"
  | "SPORTS"
  | "CONCERT"
  | "OTHER";

export type EventVisibility = "PUBLIC" | "FOLLOWERS" | "GROUP" | "BUSINESS";

export interface AdminEventItem {
  id: string;
  title: string;
  category?: EventCategory;
  visibility: EventVisibility;
  isOnline: boolean;
  isDeleted: boolean;
  startTime: string;
  createdAt: string;
  city?: string;
  country?: string;
  creator: { id: string; username: string };
  rsvpCount: number;
}

export interface AdminEventDetail extends AdminEventItem {
  description: string;
  endTime?: string;
  address?: string;
  state?: string;
  imageUrl?: string;
  groupId?: string;
  businessId?: string;
  rsvps: { going: number; interested: number; notGoing: number };
}

export type AdminEventListResponse = {
  data: AdminEventItem[];
  nextCursor?: string;
  hasMore: boolean;
};

export interface EventsQuery {
  cursor?: string;
  limit?: number;
  search?: string;
  isDeleted?: boolean;
  category?: EventCategory | "";
  visibility?: EventVisibility | "";
}
