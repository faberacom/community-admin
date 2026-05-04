import Link from "next/link";
import { AdForm } from "@/src/components/ads/ad-form";
import ChevronLeftIcon from "@/public/icons/chevron-left-icon.svg";

export default function NewAdPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <Link
        href="/ads/all"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        Back to Ads
      </Link>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">Create Ad</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create a new admin-managed advertisement
        </p>
      </div>
      <AdForm mode="create" />
    </div>
  );
}
