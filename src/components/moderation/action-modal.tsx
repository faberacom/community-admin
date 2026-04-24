"use client";

import { useState } from "react";
import { Modal } from "@/src/components/ui/modal";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { ModerationActionType } from "@/src/types";

const actionLabels: Record<ModerationActionType, string> = {
  WARN: "Warn User",
  DELETE_POST: "Delete Post",
  DELETE_COMMENT: "Delete Comment",
  BAN_USER: "Ban User",
  FEATURE_BUSINESS: "Feature Business",
  UNFEATURE_BUSINESS: "Unfeature Business",
};

const actionVariants: Record<ModerationActionType, "danger" | "outline"> = {
  WARN: "outline",
  DELETE_POST: "danger",
  DELETE_COMMENT: "danger",
  BAN_USER: "danger",
  FEATURE_BUSINESS: "outline",
  UNFEATURE_BUSINESS: "outline",
};

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: ModerationActionType;
  onConfirm: (actionType: ModerationActionType, notes?: string) => Promise<void>;
}

export function ActionModal({
  isOpen,
  onClose,
  actionType,
  onConfirm,
}: ActionModalProps) {
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(actionType, notes.trim() || undefined);
      setNotes("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setNotes("");
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={actionLabels[actionType]}
      size="sm"
    >
      <div className="p-6 space-y-4">
        <p className="text-sm text-gray-600">
          {actionType === "BAN_USER" &&
            "This will ban the reported user. They will not be able to access the platform."}
          {actionType === "DELETE_POST" &&
            "This will permanently delete the reported post."}
          {actionType === "DELETE_COMMENT" &&
            "This will permanently delete the reported comment."}
          {actionType === "WARN" &&
            "This will send a warning to the content author. The report will be marked as resolved."}
          {actionType === "FEATURE_BUSINESS" &&
            "This will feature the business. The report will be marked as resolved."}
          {actionType === "UNFEATURE_BUSINESS" &&
            "This will unfeature the business. The report will be marked as resolved."}
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Notes{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add context or notes for the audit log..."
            rows={3}
            maxLength={500}
            showCount
          />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant={actionVariants[actionType]}
            size="sm"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : actionLabels[actionType]}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
