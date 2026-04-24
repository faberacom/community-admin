import { ReportsView } from "@/src/components/moderation/reports-view";

export default function ModerationPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">Moderation</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and resolve user reports
        </p>
      </div>
      <ReportsView />
    </div>
  );
}
