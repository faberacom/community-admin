import { AdsPricingView } from "@/src/components/ads/ads-pricing-view";

export default function AdsPricingPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">Ad Pricing</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure pricing tiers for user-submitted ads
        </p>
      </div>
      <AdsPricingView />
    </div>
  );
}
