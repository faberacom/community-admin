import { RevenueAnalyticsView } from "@/src/components/analytics/revenue-analytics";

export default function RevenueAnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">Revenue Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Payment revenue by status and type
        </p>
      </div>
      <RevenueAnalyticsView />
    </div>
  );
}
