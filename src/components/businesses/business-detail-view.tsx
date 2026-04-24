"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AdminBusinessDetail, AdminBusinessPayment } from "@/src/types";
import { businessesService } from "@/src/services/businesses.service";
import { Button } from "@/src/components/ui/button";
import { ConfirmModal } from "@/src/components/ui/confirm-modal";
import { formatDate, formatDateTime } from "@/src/utils/date";
import CheckRoundedIcon from "@/public/icons/check-rounded-icon.svg";
import StarIcon from "@/public/icons/star-icon.svg";
import PhoneIcon from "@/public/icons/phone-icon.svg";
import MailIcon from "@/public/icons/mail-icon.svg";
import LocationIcon from "@/public/icons/location-icon.svg";
import PeopleIcon from "@/public/icons/people-icon.svg";
import FeedIcon from "@/public/icons/feed.svg";

const paymentStatusStyles: Record<string, string> = {
  COMPLETED: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-500",
};

function PaymentRow({ payment }: { payment: AdminBusinessPayment }) {
  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-4 py-3 text-gray-800 font-medium">
        {payment.currency}{" "}
        {parseFloat(payment.amount).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </td>
      <td className="px-4 py-3 text-gray-500">{payment.paymentType}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${paymentStatusStyles[payment.status] ?? "bg-gray-100 text-gray-500"}`}
        >
          {payment.status.charAt(0) + payment.status.slice(1).toLowerCase()}
        </span>
      </td>
      <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">
        {formatDateTime(payment.createdAt)}
      </td>
    </tr>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 text-sm">
      <div className="w-4 h-4 mt-0.5 text-gray-400 shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-gray-700">{value}</p>
      </div>
    </div>
  );
}

interface BusinessDetailViewProps {
  businessId: string;
}

export function BusinessDetailView({ businessId }: BusinessDetailViewProps) {
  const [business, setBusiness] = useState<AdminBusinessDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const router = useRouter();

  useEffect(() => {
    businessesService
      .getById(businessId)
      .then(setBusiness)
      .catch(() => toast.error("Failed to load business"))
      .finally(() => setIsLoading(false));
  }, [businessId]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
          <div className="h-6 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-32 bg-gray-100 rounded" />
          <div className="h-4 w-56 bg-gray-100 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl h-16" />
          <div className="bg-gray-50 rounded-xl h-16" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 h-40" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="text-center py-20 text-gray-400">
        Business not found.
      </div>
    );
  }

  const handleToggleVerify = async () => {
    const updated = await businessesService.setVerified(
      business.id,
      !business.isVerified,
    );
    setBusiness((prev) =>
      prev
        ? {
            ...prev,
            isVerified: updated.isVerified,
            isFeatured: updated.isFeatured,
          }
        : prev,
    );
    toast.success(
      updated.isVerified
        ? `"${business.name}" verified`
        : `"${business.name}" unverified`,
    );
  };

  const handleToggleFeature = async () => {
    const updated = await businessesService.setFeatured(
      business.id,
      !business.isFeatured,
    );
    setBusiness((prev) =>
      prev
        ? {
            ...prev,
            isVerified: updated.isVerified,
            isFeatured: updated.isFeatured,
          }
        : prev,
    );
    toast.success(
      updated.isFeatured
        ? `"${business.name}" featured`
        : `"${business.name}" unfeatured`,
    );
  };

  const handleDelete = async () => {
    await businessesService.delete(business.id);
    toast.success(`"${business.name}" deleted`);
    router.push("/businesses");
  };

  const location = [business.city, business.state, business.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900">
                {business.name}
              </h2>
              {business.isVerified && (
                <span
                  title="Verified"
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600"
                >
                  <CheckRoundedIcon className="w-3 h-3" />
                </span>
              )}
              {business.isFeatured && (
                <span
                  title="Featured"
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-600"
                >
                  <StarIcon className="w-3 h-3" />
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-0.5">
              by @{business.owner.username} · {business.category}
            </p>
          </div>
          <p className="text-xs text-gray-400">
            Joined {formatDate(business.createdAt)}
          </p>
        </div>

        {business.description && (
          <p className="mt-3 text-sm text-gray-600">{business.description}</p>
        )}

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoRow
            icon={<MailIcon className="w-4 h-4" />}
            label="Email"
            value={business.email}
          />
          <InfoRow
            icon={<PhoneIcon className="w-4 h-4" />}
            label="Phone"
            value={business.phone}
          />
          <InfoRow
            icon={<LocationIcon className="w-4 h-4" />}
            label="Location"
            value={location || undefined}
          />
          {business.websiteUrl && (
            <InfoRow
              icon={
                <span className="text-gray-400 text-xs font-bold">URL</span>
              }
              label="Website"
              value={business.websiteUrl}
            />
          )}
        </div>
      </div>

      {/* Stats */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Activity
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm">
              <PeopleIcon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Followers</p>
              <p className="text-lg font-bold text-gray-900">
                {business.followerCount.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm">
              <FeedIcon className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Posts</p>
              <p className="text-lg font-bold text-gray-900">
                {business.postCount.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm">
              <span className="text-sm font-bold text-teal-600">₦</span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Payments</p>
              <p className="text-lg font-bold text-gray-900">
                {business.paymentCount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent payments */}
      {business.recentPayments.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Recent Payments
          </h3>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {business.recentPayments.map((payment) => (
                    <PaymentRow key={payment.id} payment={payment} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {!business.isDeleted && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Actions
          </h3>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-wrap gap-3">
            <Button
              variant={business.isVerified ? "outline" : "primary"}
              size="sm"
              onClick={handleToggleVerify}
            >
              {business.isVerified ? "Unverify" : "Verify business"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleFeature}
            >
              {business.isFeatured ? "Unfeature" : "Feature business"}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDelete(true)}
            >
              Delete business
            </Button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete business"
        message={`This will permanently delete "${business.name}". This cannot be undone.`}
        confirmLabel="Delete business"
        variant="danger"
      />
    </div>
  );
}
