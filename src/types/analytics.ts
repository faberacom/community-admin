export interface OverviewStats {
  users: {
    total: number;
    active: number;
    banned: number;
    newThisWeek: number;
  };
  posts: {
    total: number;
    deletedCount: number;
  };
  comments: {
    total: number;
  };
  groups: {
    total: number;
    pendingApproval: number;
  };
  businesses: {
    total: number;
    verified: number;
    featured: number;
  };
  blogs: {
    total: number;
    published: number;
    draft: number;
    hidden: number;
  };
  events: {
    total: number;
  };
  reports: {
    open: number;
    underReview: number;
  };
  revenue: {
    totalCompleted: string;
    currency: string;
  };
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: { last7Days: number; last30Days: number };
  newUsers: { last7Days: number; last30Days: number };
  bannedUsers: number;
  byRole: { user: number; admin: number; superAdmin: number };
}

export interface ContentAnalytics {
  posts: { total: number; last7Days: number; last30Days: number };
  comments: { total: number; last7Days: number; last30Days: number };
  reactions: { total: number; last7Days: number; last30Days: number };
}

export interface RevenueAnalytics {
  totalCompleted: string;
  totalPending: string;
  totalFailed: string;
  totalRefunded: string;
  byType: { payment_type: string; total: string; count: number }[];
  currency: string;
}
