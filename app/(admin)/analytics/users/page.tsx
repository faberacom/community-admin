import { UserAnalyticsView } from "@/src/components/analytics/user-analytics";

export default function UserAnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">User Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          User growth, activity, and role distribution
        </p>
      </div>
      <UserAnalyticsView />
    </div>
  );
}
