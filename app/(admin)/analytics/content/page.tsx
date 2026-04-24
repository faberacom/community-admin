import { ContentAnalyticsView } from "@/src/components/analytics/content-analytics";

export default function ContentAnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">Content Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Posts, comments, and reactions over time
        </p>
      </div>
      <ContentAnalyticsView />
    </div>
  );
}
