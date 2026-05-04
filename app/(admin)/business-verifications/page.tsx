import { BusinessVerificationsView } from "@/src/components/business-verifications/business-verifications-view";

export default function BusinessVerificationsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">
          Business Verifications
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and action business verification requests
        </p>
      </div>
      <BusinessVerificationsView />
    </div>
  );
}
