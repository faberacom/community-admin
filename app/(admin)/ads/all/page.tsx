import { AdsView } from "@/src/components/ads/ads-view";

export default function AdsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">Ads</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage platform advertisements
        </p>
      </div>
      <AdsView />
    </div>
  );
}
