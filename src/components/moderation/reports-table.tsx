"use client";

import Link from "next/link";
import { Report } from "@/src/types";
import { formatDate } from "@/src/utils/date";
import { ReportStatusBadge } from "./report-status-badge";
import { TargetTypeBadge } from "./target-type-badge";

const reasonLabels: Record<string, string> = {
  SPAM: "Spam",
  HARASSMENT: "Harassment",
  HATE: "Hate Speech",
  MISINFORMATION: "Misinformation",
  OTHER: "Other",
};

interface ReportsTableProps {
  reports: Report[];
}

function TableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Type
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Reason
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">
              Reporter
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">
              Date
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {[...Array(6)].map((_, i) => (
            <tr key={i} className="border-b border-gray-50">
              <td className="px-4 py-3">
                <div className="h-5 w-16 bg-gray-200 rounded" />
              </td>
              <td className="px-4 py-3">
                <div className="h-4 w-24 bg-gray-100 rounded" />
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <div className="h-4 w-20 bg-gray-100 rounded" />
              </td>
              <td className="px-4 py-3 hidden lg:table-cell">
                <div className="h-4 w-20 bg-gray-100 rounded" />
              </td>
              <td className="px-4 py-3">
                <div className="h-5 w-16 bg-gray-200 rounded-full" />
              </td>
              <td className="px-4 py-3">
                <div className="h-4 w-14 bg-gray-100 rounded" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { TableSkeleton as ReportsTableSkeleton };

export function ReportsTable({ reports }: ReportsTableProps) {
  if (reports.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
        No reports found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Reason
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                Reporter
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                Date
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {reports.map((report) => (
              <tr
                key={report.id}
                className="hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <TargetTypeBadge type={report.targetType} />
                </td>
                <td className="px-4 py-3 text-gray-700 font-medium">
                  {reasonLabels[report.reason] ?? report.reason}
                </td>
                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                  @{report.reporterUsername}
                </td>
                <td className="px-4 py-3 text-gray-400 hidden lg:table-cell">
                  {formatDate(report.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <ReportStatusBadge status={report.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/moderation/${report.id}`}
                    className="text-primary hover:underline text-xs font-medium"
                  >
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
