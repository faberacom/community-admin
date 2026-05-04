import Link from "next/link";
import { BusinessVerificationDetailView } from "@/src/components/business-verifications/business-verification-detail-view";
import ChevronLeftIcon from "@/public/icons/chevron-left-icon.svg";

export default async function BusinessVerificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="max-w-7xl mx-auto">
      <Link
        href="/business-verifications"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        Back to Business Verifications
      </Link>

      <div className="max-w-3xl">
        <BusinessVerificationDetailView verificationId={id} />
      </div>
    </div>
  );
}
