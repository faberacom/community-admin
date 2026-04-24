"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { analyticsService } from "@/src/services/analytics.service";
import { UserAnalytics } from "@/src/types";
import { StatCard, StatCardSkeleton } from "@/src/components/dashboard/stat-card";
import { ChartCard, ChartCardSkeleton } from "./chart-card";
import { ComparisonBarChart, ComparisonBarData } from "./comparison-bar-chart";
import { DonutChart, DonutSlice } from "./donut-chart";
import PeopleIcon from "@/public/icons/people-icon.svg";
import UserIcon from "@/public/icons/user.svg";

export function UserAnalyticsView() {
  const [data, setData] = useState<UserAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    analyticsService
      .getUserAnalytics()
      .then(setData)
      .catch(() => toast.error("Failed to load user analytics"))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
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
      label: "Active Users",
      "Last 7 days": data.activeUsers.last7Days,
      "Last 30 days": data.activeUsers.last30Days,
    },
    {
      label: "New Users",
      "Last 7 days": data.newUsers.last7Days,
      "Last 30 days": data.newUsers.last30Days,
    },
  ];

  const roleData: DonutSlice[] = [
    { label: "Users", value: data.byRole.user, color: "#007521" },
    { label: "Admins", value: data.byRole.admin, color: "#3b82f6" },
    { label: "Super Admins", value: data.byRole.superAdmin, color: "#a855f7" },
  ].filter((s) => s.value > 0);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={data.totalUsers}
          icon={<PeopleIcon className="w-5 h-5 text-primary" />}
          iconBg="bg-primary/10"
        />
        <StatCard
          label="Active (Last 7 days)"
          value={data.activeUsers.last7Days}
          subText={`30d: ${data.activeUsers.last30Days.toLocaleString()}`}
          icon={<UserIcon className="w-5 h-5 text-green-600" />}
          iconBg="bg-green-50"
        />
        <StatCard
          label="New (Last 7 days)"
          value={data.newUsers.last7Days}
          subText={`30d: ${data.newUsers.last30Days.toLocaleString()}`}
          icon={<PeopleIcon className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50"
        />
        <StatCard
          label="Banned Users"
          value={data.bannedUsers}
          icon={<UserIcon className="w-5 h-5 text-red-500" />}
          iconBg="bg-red-50"
          badge={
            data.bannedUsers > 0
              ? { text: "Banned", variant: "red" }
              : undefined
          }
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Active vs New Users"
          description="Comparison between last 7 and last 30 days"
        >
          <ComparisonBarChart data={activityData} height={220} />
        </ChartCard>

        <ChartCard
          title="Users by Role"
          description="Distribution of users across roles"
        >
          <DonutChart data={roleData} height={220} />
        </ChartCard>
      </div>

      {/* Role breakdown table */}
      <ChartCard title="Role Breakdown" description="Exact counts per role">
        <div className="divide-y divide-gray-50">
          {[
            {
              role: "Users",
              count: data.byRole.user,
              color: "bg-primary",
              badge: "bg-primary/10 text-primary",
            },
            {
              role: "Admins",
              count: data.byRole.admin,
              color: "bg-blue-500",
              badge: "bg-blue-50 text-blue-700",
            },
            {
              role: "Super Admins",
              count: data.byRole.superAdmin,
              color: "bg-purple-500",
              badge: "bg-purple-50 text-purple-700",
            },
          ].map(({ role, count, color, badge }) => {
            const pct =
              data.totalUsers > 0
                ? ((count / data.totalUsers) * 100).toFixed(1)
                : "0";
            return (
              <div key={role} className="flex items-center gap-4 py-3">
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${badge}`}
                >
                  {role}
                </span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color} transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-16 text-right">
                  {count.toLocaleString()}
                </span>
                <span className="text-xs text-gray-400 w-12 text-right">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </ChartCard>
    </div>
  );
}
