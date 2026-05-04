"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  AdminVerificationDetail,
  VerificationStatus,
  VERIFICATION_DOCUMENT_TYPE_LABELS,
} from "@/src/types";
import { businessVerificationsService } from "@/src/services/business-verifications.service";
import { Button } from "@/src/components/ui/button";
import { ConfirmModal } from "@/src/components/ui/confirm-modal";
import { Modal } from "@/src/components/ui/modal";
import { Textarea } from "@/src/components/ui/textarea";
import { formatDate, formatDateTime } from "@/src/utils/date";
import { getMediaUrl } from "@/src/utils/functions";
import PhoneIcon from "@/public/icons/phone-icon.svg";
import MailIcon from "@/public/icons/mail-icon.svg";
import LocationIcon from "@/public/icons/location-icon.svg";

const statusStyles: Record<VerificationStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  UNDER_REVIEW: "bg-blue-100 text-blue-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

const statusLabels: Record<VerificationStatus, string> = {
  PENDING: "Pending",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

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

interface BusinessVerificationDetailViewProps {
  verificationId: string;
}

export function BusinessVerificationDetailView({
  verificationId,
}: BusinessVerificationDetailViewProps) {
  const [verification, setVerification] =
    useState<AdminVerificationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = () =>
    businessVerificationsService
      .getById(verificationId)
      .then(setVerification)
      .catch(() => toast.error("Failed to load verification"))
      .finally(() => setIsLoading(false));

  useEffect(() => {
    load();
  }, [verificationId]);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
            <div className="h-5 w-40 bg-gray-200 rounded" />
            <div className="h-4 w-32 bg-gray-100 rounded" />
            <div className="h-4 w-28 bg-gray-100 rounded" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
            <div className="h-4 w-24 bg-gray-100 rounded" />
            <div className="h-4 w-32 bg-gray-100 rounded" />
            <div className="h-5 w-20 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 h-40" />
      </div>
    );
  }

  if (!verification) {
    return (
      <div className="text-center py-20 text-gray-400">
        Verification not found.
      </div>
    );
  }

  const { business } = verification;
  const isActionable =
    verification.status === "PENDING" || verification.status === "UNDER_REVIEW";
  const location = [business.city, business.country].filter(Boolean).join(", ");

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await businessVerificationsService.review(verificationId, {
        action: "APPROVE",
      });
      setIsLoading(true);
      await load();
      toast.success("Business verified successfully");
    } catch {
      toast.error("Failed to approve verification");
    } finally {
      setIsSubmitting(false);
      setShowApprove(false);
    }
  };

  const handleReject = async () => {
    if (!rejectNotes.trim()) return;
    setIsSubmitting(true);
    try {
      await businessVerificationsService.review(verificationId, {
        action: "REJECT",
        notes: rejectNotes.trim(),
      });
      setRejectNotes("");
      setIsLoading(true);
      await load();
      toast.success("Verification rejected");
    } catch {
      toast.error("Failed to reject verification");
    } finally {
      setIsSubmitting(false);
      setShowReject(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top row: business info + submission meta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Business info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div>
            <Link
              href={`/businesses/${business.id}`}
              className="text-lg font-bold text-gray-900 hover:text-primary transition-colors"
            >
              {business.name}
            </Link>
            {business.category && (
              <p className="text-xs text-gray-400 mt-0.5">
                {business.category}
              </p>
            )}
          </div>
          <div className="space-y-3">
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
          </div>
        </div>

        {/* Submission meta */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Submitted by</p>
            <p className="text-sm font-medium text-gray-800">
              @{verification.submittedBy.username}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Submitted on</p>
            <p className="text-sm text-gray-700">
              {formatDate(verification.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Status</p>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${statusStyles[verification.status]}`}
            >
              {statusLabels[verification.status]}
            </span>
          </div>
          {verification.reviewedAt && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Reviewed on</p>
              <p className="text-sm text-gray-700">
                {formatDateTime(verification.reviewedAt)}
              </p>
            </div>
          )}
          {verification.notes && verification.status === "REJECTED" && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Rejection reason</p>
              <p className="text-sm text-gray-600 italic">
                &ldquo;{verification.notes}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Documents */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Submitted Documents ({verification.documents.length})
        </h3>
        {verification.documents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
            No documents attached.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {verification.documents.map((doc) => {
              const isPdf = getMediaUrl(doc.viewUrl)
                .toLowerCase()
                .endsWith(".pdf");

              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden"
                >
                  {isPdf ? (
                    <div className="h-40 bg-gray-50 flex items-center justify-center ">
                      <a
                        href={getMediaUrl(doc.viewUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline font-medium"
                      >
                        Open PDF ↗
                      </a>
                    </div>
                  ) : (
                    <img
                      src={getMediaUrl(doc.viewUrl)}
                      alt={VERIFICATION_DOCUMENT_TYPE_LABELS[doc.type]}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="px-3 py-2.5 flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-gray-700">
                      {VERIFICATION_DOCUMENT_TYPE_LABELS[doc.type]}
                    </p>
                    {!isPdf && (
                      <a
                        href={getMediaUrl(doc.viewUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:text-primary transition-colors"
                      >
                        Open ↗
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      {isActionable && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Actions
          </h3>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowApprove(true)}
            >
              Approve
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowReject(true)}
            >
              Reject
            </Button>
          </div>
        </div>
      )}

      {/* Reviewed state */}
      {!isActionable && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500">
            This verification has been{" "}
            <span className="font-medium text-gray-800">
              {statusLabels[verification.status].toLowerCase()}
            </span>
            {verification.reviewedAt && (
              <> on {formatDateTime(verification.reviewedAt)}</>
            )}
            .
          </p>
        </div>
      )}

      {/* Approve confirm */}
      <ConfirmModal
        isOpen={showApprove}
        onClose={() => setShowApprove(false)}
        onConfirm={handleApprove}
        title="Approve verification"
        message="This will verify the business and mark them as verified on the platform."
        confirmLabel="Approve"
        variant="default"
      />

      {/* Reject modal */}
      <Modal
        isOpen={showReject}
        onClose={() => {
          if (!isSubmitting) {
            setShowReject(false);
            setRejectNotes("");
          }
        }}
        title="Reject Verification"
        size="sm"
      >
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Provide a reason for rejecting this verification request. The
            business owner will be able to see this note.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Rejection reason <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="Explain why the verification was rejected…"
              rows={4}
              maxLength={500}
              showCount
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowReject(false);
                setRejectNotes("");
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleReject}
              disabled={!rejectNotes.trim() || isSubmitting}
            >
              {isSubmitting ? "Rejecting…" : "Reject"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
