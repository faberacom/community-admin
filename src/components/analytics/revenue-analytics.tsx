"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { analyticsService } from "@/src/services/analytics.service";
import { RevenueAnalytics } from "@/src/types";
import { StatCard, StatCardSkeleton } from "@/src/components/dashboard/stat-card";
import { ChartCard, ChartCardSkeleton } from "./chart-card";
import { SingleBarChart, SingleBarData } from "./single-bar-chart";
import StarIcon from "@/public/icons/star-icon.svg";
import ClockIcon from "@/public/icons/clock-icon.svg";
import CheckIcon from "@/public/icons/check-icon.svg";

function formatAmount(amount: string, currency: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return `${currency} 0.00`;
  return `${currency.toUpperCase()} ${num.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function RevenueAnalyticsView() {
  const [data, setData] = useState<RevenueAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    analyticsService
      .getRevenueAnalytics()
      .then(setData)
      .catch(() => toast.error("Failed to load revenue analytics"))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <ChartCardSkeleton />
        <ChartCardSkeleton />
      </div>
    );
  }

  if (!data) return null;

  const cur = data.currency;

  const byTypeChartData: SingleBarData[] = data.byType.map((item, i) => ({
    label: item.payment_type
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    value: parseFloat(item.total) || 0,
    color: ["#007521", "#3b82f6", "#a855f7", "#f59e0b", "#06b6d4"][i % 5],
  }));

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Completed"
          value={formatAmount(data.totalCompleted, cur)}
          icon={<CheckIcon className="w-5 h-5 text-green-600" />}
          iconBg="bg-green-50"
          badge={{ text: "Completed", variant: "green" }}
        />
        <StatCard
          label="Pending"
          value={formatAmount(data.totalPending, cur)}
          icon={<ClockIcon className="w-5 h-5 text-amber-600" />}
          iconBg="bg-amber-50"
          badge={
            parseFloat(data.totalPending) > 0
              ? { text: "Pending", variant: "amber" }
              : undefined
          }
        />
        <StatCard
          label="Failed"
          value={formatAmount(data.totalFailed, cur)}
          icon={<StarIcon className="w-5 h-5 text-red-500" />}
          iconBg="bg-red-50"
          badge={
            parseFloat(data.totalFailed) > 0
              ? { text: "Failed", variant: "red" }
              : undefined
          }
        />
        <StatCard
          label="Refunded"
          value={formatAmount(data.totalRefunded, cur)}
          icon={<StarIcon className="w-5 h-5 text-gray-500" />}
          iconBg="bg-gray-50"
        />
      </div>

      {/* Revenue by type chart */}
      {byTypeChartData.length > 0 && (
        <ChartCard
          title="Revenue by Payment Type"
          description={`Total completed revenue broken down by type (${cur.toUpperCase()})`}
        >
          <SingleBarChart
            data={byTypeChartData}
            height={240}
            valuePrefix={`${cur.toUpperCase()} `}
          />
        </ChartCard>
      )}

      {/* Payment type breakdown table */}
      <ChartCard
        title="Payment Type Breakdown"
        description="All payment types with totals and transaction counts"
      >
        {data.byType.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">
            No payment data available
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Payment Type
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Transactions
                  </th>
                  <th className="text-right py-3 pl-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total ({cur.toUpperCase()})
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.byType.map((item, i) => {
                  const colors = [
                    "bg-primary/10 text-primary",
                    "bg-blue-50 text-blue-700",
                    "bg-purple-50 text-purple-700",
                    "bg-amber-50 text-amber-700",
                    "bg-cyan-50 text-cyan-700",
                  ];
                  const badge = colors[i % colors.length];
                  const label = item.payment_type
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase());
                  const total = parseFloat(item.total) || 0;

                  return (
                    <tr key={item.payment_type} className="hover:bg-gray-50/50">
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${badge}`}
                        >
                          {label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {item.count.toLocaleString()}
                      </td>
                      <td className="py-3 pl-4 text-right font-semibold text-gray-900">
                        {total.toLocaleString("en-NG", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200">
                  <td className="py-3 pr-4 text-xs font-semibold text-gray-500 uppercase">
                    Total
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">
                    {data.byType
                      .reduce((s, r) => s + r.count, 0)
                      .toLocaleString()}
                  </td>
                  <td className="py-3 pl-4 text-right font-bold text-primary text-base">
                    {(parseFloat(data.totalCompleted) || 0).toLocaleString(
                      "en-NG",
                      { minimumFractionDigits: 2 },
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </ChartCard>
    </div>
  );
}
