import { BusinessesView } from "@/src/components/businesses/businesses-view";

export default function BusinessesPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">Businesses</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage businesses — verify, feature, and review payments
        </p>
      </div>
      <BusinessesView />
    </div>
  );
}
