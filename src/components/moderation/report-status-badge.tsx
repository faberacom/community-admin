import { ReportStatus } from "@/src/types";

const styles: Record<ReportStatus, string> = {
  OPEN: "bg-red-100 text-red-700",
  UNDER_REVIEW: "bg-amber-100 text-amber-700",
  RESOLVED: "bg-green-100 text-green-700",
  DISMISSED: "bg-gray-100 text-gray-500",
};

const labels: Record<ReportStatus, string> = {
  OPEN: "Open",
  UNDER_REVIEW: "Under Review",
  RESOLVED: "Resolved",
  DISMISSED: "Dismissed",
};

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
