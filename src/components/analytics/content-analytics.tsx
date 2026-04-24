"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { analyticsService } from "@/src/services/analytics.service";
import { ContentAnalytics } from "@/src/types";
import { StatCard, StatCardSkeleton } from "@/src/components/dashboard/stat-card";
import { ChartCard, ChartCardSkeleton } from "./chart-card";
import { ComparisonBarChart, ComparisonBarData } from "./comparison-bar-chart";
import { SingleBarChart, SingleBarData } from "./single-bar-chart";
import FeedIcon from "@/public/icons/feed.svg";
import CommentIcon from "@/public/icons/comment-icon.svg";
import LikeIcon from "@/public/icons/like-icon-outline.svg";

export function ContentAnalyticsView() {
  const [data, setData] = useState<ContentAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    analyticsService
      .getContentAnalytics()
      .then(setData)
      .catch(() => toast.error("Failed to load content analytics"))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCardSkeleton />
          <ChartCardSkeleton />
        </div>
        <ChartCardSkeleton />
      </div>
    );
  }

  if (!data) return null;

  const activityData: ComparisonBarData[] = [
    {
      label: "Posts",
      "Last 7 days": data.posts.last7Days,
      "Last 30 days": data.posts.last30Days,
    },
    {
      label: "Comments",
      "Last 7 days": data.comments.last7Days,
      "Last 30 days": data.comments.last30Days,
    },
    {
      label: "Reactions",
      "Last 7 days": data.reactions.last7Days,
      "Last 30 days": data.reactions.last30Days,
    },
  ];

  const totalsData: SingleBarData[] = [
    { label: "Posts", value: data.posts.total, color: "#007521" },
    { label: "Comments", value: data.comments.total, color: "#3b82f6" },
    { label: "Reactions", value: data.reactions.total, color: "#ec4899" },
  ];

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Posts"
          value={data.posts.total}
          subText={`7d: ${data.posts.last7Days.toLocaleString()} · 30d: ${data.posts.last30Days.toLocaleString()}`}
          icon={<FeedIcon className="w-5 h-5 text-primary" />}
          iconBg="bg-primary/10"
          href="/content/posts"
        />
        <StatCard
          label="Total Comments"
          value={data.comments.total}
          subText={`7d: ${data.comments.last7Days.toLocaleString()} · 30d: ${data.comments.last30Days.toLocaleString()}`}
          icon={<CommentIcon className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50"
          href="/content/comments"
        />
        <StatCard
          label="Total Reactions"
          value={data.reactions.total}
          subText={`7d: ${data.reactions.last7Days.toLocaleString()} · 30d: ${data.reactions.last30Days.toLocaleString()}`}
          icon={<LikeIcon className="w-5 h-5 text-pink-600" />}
          iconBg="bg-pink-50"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Activity — 7d vs 30d"
          description="New posts, comments, and reactions over the last periods"
        >
          <ComparisonBarChart data={activityData} height={220} />
        </ChartCard>

        <ChartCard
          title="All-time Totals"
          description="Cumulative posts, comments, and reactions"
        >
          <SingleBarChart data={totalsData} height={220} />
        </ChartCard>
      </div>

      {/* Detailed breakdown table */}
      <ChartCard title="Content Breakdown" description="Detailed metrics per content type">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Last 7 days
                </th>
                <th className="text-right py-3 pl-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Last 30 days
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                {
                  type: "Posts",
                  color: "bg-primary",
                  badge: "bg-primary/10 text-primary",
                  ...data.posts,
                },
                {
                  type: "Comments",
                  color: "bg-blue-500",
                  badge: "bg-blue-50 text-blue-700",
                  ...data.comments,
                },
                {
                  type: "Reactions",
                  color: "bg-pink-500",
                  badge: "bg-pink-50 text-pink-700",
                  ...data.reactions,
                },
              ].map(({ type, badge, total, last7Days, last30Days }) => (
                <tr key={type} className="hover:bg-gray-50/50">
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${badge}`}
                    >
                      {type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900">
                    {total.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    +{last7Days.toLocaleString()}
                  </td>
                  <td className="py-3 pl-4 text-right text-gray-600">
                    +{last30Days.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}
