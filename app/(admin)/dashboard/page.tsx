import { OverviewStatsGrid } from "@/src/components/dashboard/overview-stats";

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of the Nigerian Community platform
        </p>
      </div>

      {/* Stats */}
      <OverviewStatsGrid />
    </div>
  );
}
