"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { StatCard, StatCardSkeleton } from "./stat-card";
import { analyticsService } from "@/src/services/analytics.service";
import { OverviewStats } from "@/src/types";
import PeopleIcon from "@/public/icons/people-icon.svg";
import FeedIcon from "@/public/icons/feed.svg";
import GroupsIcon from "@/public/icons/groups.svg";
import BusinessIcon from "@/public/icons/business.svg";
import EventIcon from "@/public/icons/event.svg";
import ReportIcon from "@/public/icons/report-icon.svg";
import BlogIcon from "@/public/icons/blog-icon.svg";
import CheckIcon from "@/public/icons/check-icon.svg";
import StarIcon from "@/public/icons/star-icon.svg";
import CommentIcon from "@/public/icons/comment-icon.svg";
import MailIcon from "@/public/icons/mail-icon.svg";
import UserIcon from "@/public/icons/user.svg";

export function OverviewStatsGrid() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    analyticsService
      .getOverview()
      .then(setStats)
      .catch(() => toast.error("Failed to load overview stats"))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonRow label="Users" />
        <SkeletonRow label="Content" />
        <SkeletonRow label="Platform" />
      </div>
    );
  }

  if (!stats) return null;

  const currency = stats.revenue.currency.toUpperCase();
  const revenueValue = `${currency} ${parseFloat(stats.revenue.totalCompleted).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      {/* Row 1 — Users */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Users
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Total Users"
            value={stats.users.total}
            icon={<PeopleIcon className="w-5 h-5 text-primary" />}
            iconBg="bg-primary/10"
            href="/users"
          />
          <StatCard
            label="Active Users"
            value={stats.users.active}
            icon={<UserIcon className="w-5 h-5 text-green-600" />}
            iconBg="bg-green-50"
            href="/users?isActive=true"
          />
          <StatCard
            label="Banned Users"
            value={stats.users.banned}
            icon={<UserIcon className="w-5 h-5 text-red-500" />}
            iconBg="bg-red-50"
            href="/users?isActive=false"
            badge={
              stats.users.banned > 0
                ? { text: "Banned", variant: "red" }
                : undefined
            }
          />
          <StatCard
            label="New This Week"
            value={stats.users.newThisWeek}
            icon={<PeopleIcon className="w-5 h-5 text-blue-600" />}
            iconBg="bg-blue-50"
            href="/analytics/users"
          />
        </div>
      </section>

      {/* Row 2 — Content */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Content
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Total Posts"
            value={stats.posts.total}
            subText={
              stats.posts.deletedCount > 0
                ? `${stats.posts.deletedCount} soft-deleted`
                : undefined
            }
            icon={<FeedIcon className="w-5 h-5 text-primary" />}
            iconBg="bg-primary/10"
            href="/content/posts"
          />
          <StatCard
            label="Total Comments"
            value={stats.comments.total}
            icon={<CommentIcon className="w-5 h-5 text-indigo-600" />}
            iconBg="bg-indigo-50"
            href="/content/comments"
          />
          <StatCard
            label="Total Groups"
            value={stats.groups.total}
            icon={<GroupsIcon className="w-5 h-5 text-amber-600" />}
            iconBg="bg-amber-50"
            href="/groups"
            badge={
              stats.groups.pendingApproval > 0
                ? {
                    text: `${stats.groups.pendingApproval} pending`,
                    variant: "amber",
                  }
                : undefined
            }
          />
          <StatCard
            label="Total Events"
            value={stats.events.total}
            icon={<EventIcon className="w-5 h-5 text-pink-600" />}
            iconBg="bg-pink-50"
          />
        </div>
      </section>

      {/* Row 3 — Platform */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Platform
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Businesses"
            value={stats.businesses.total}
            subText={`Verified: ${stats.businesses.verified} · Featured: ${stats.businesses.featured}`}
            icon={<BusinessIcon className="w-5 h-5 text-teal-600" />}
            iconBg="bg-teal-50"
            href="/businesses"
          />
          <StatCard
            label="Blog Posts"
            value={stats.blogs.total}
            subText={`Published: ${stats.blogs.published} · Draft: ${stats.blogs.draft}`}
            icon={<BlogIcon className="w-5 h-5 text-orange-600" />}
            iconBg="bg-orange-50"
          />
          <StatCard
            label="Open Reports"
            value={stats.reports.open}
            subText={
              stats.reports.underReview > 0
                ? `${stats.reports.underReview} under review`
                : undefined
            }
            icon={<ReportIcon className="w-5 h-5 text-red-600" />}
            iconBg="bg-red-50"
            href="/moderation"
            badge={
              stats.reports.open > 0
                ? { text: "Needs action", variant: "red" }
                : undefined
            }
          />
          {/* <StatCard
            label="Revenue"
            value={revenueValue}
            subText="Total completed payments"
            icon={<StarIcon className="w-5 h-5 text-yellow-600" />}
            iconBg="bg-yellow-50"
            href="/analytics/revenue"
          /> */}
        </div>
      </section>
    </div>
  );
}

function SkeletonRow({ label }: { label: string }) {
  return (
    <section>
      <div className="h-3 w-16 bg-gray-200 rounded animate-pulse mb-3" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
