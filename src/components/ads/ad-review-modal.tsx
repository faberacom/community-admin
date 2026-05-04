"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { AdResponse, AD_PLACEMENT_LABELS } from "@/src/types";
import { adsService } from "@/src/services/ads.service";
import { Modal } from "@/src/components/ui/modal";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { getMediaUrl } from "@/src/utils/functions";
import { formatDate } from "@/src/utils/date";

interface AdReviewModalProps {
  ad: AdResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onReviewed: () => void;
}

export function AdReviewModal({
  ad,
  isOpen,
  onClose,
  onReviewed,
}: AdReviewModalProps) {
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (isSubmitting) return;
    setIsRejecting(false);
    setRejectionNotes("");
    onClose();
  };

  const handleApprove = async () => {
    if (!ad) return;
    setIsSubmitting(true);
    try {
      await adsService.review(ad.id, { action: "APPROVE" });
      toast.success("Ad approved");
      onReviewed();
      handleClose();
    } catch {
      toast.error("Failed to approve ad");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!ad || !rejectionNotes.trim()) return;
    setIsSubmitting(true);
    try {
      await adsService.review(ad.id, {
        action: "REJECT",
        rejectionNotes: rejectionNotes.trim(),
      });
      toast.success("Ad rejected");
      onReviewed();
      handleClose();
    } catch {
      toast.error("Failed to reject ad");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!ad) return null;

  const dateRange =
    ad.startsAt && ad.endsAt
      ? `${formatDate(ad.startsAt)} – ${formatDate(ad.endsAt)}`
      : ad.startsAt
        ? `From ${formatDate(ad.startsAt)}`
        : null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Review Ad" size="md">
      <div className="p-6 space-y-4">
        {ad.imageUrl && (
          <img
            src={getMediaUrl(ad.imageUrl)}
            alt={ad.title ?? "Ad image"}
            className="w-full max-h-48 object-cover rounded-lg"
          />
        )}

        <div className="space-y-2">
          {ad.title && (
            <p className="font-semibold text-gray-900">{ad.title}</p>
          )}
          {ad.description && (
            <p className="text-sm text-gray-600">{ad.description}</p>
          )}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
              {AD_PLACEMENT_LABELS[ad.placement]}
            </span>
            {dateRange && <span className="text-gray-500">{dateRange}</span>}
          </div>
          {ad.targetUrl && (
            <a
              href={ad.targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline break-all"
            >
              {ad.targetUrl} ↗
            </a>
          )}
        </div>

        {isRejecting ? (
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Rejection reason <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                placeholder="Explain why this ad is being rejected…"
                rows={3}
                maxLength={500}
                showCount
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsRejecting(false);
                  setRejectionNotes("");
                }}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleReject}
                disabled={!rejectionNotes.trim() || isSubmitting}
              >
                {isSubmitting ? "Rejecting…" : "Reject"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsRejecting(true)}
              disabled={isSubmitting}
            >
              Reject
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleApprove}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Approving…" : "Approve"}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
