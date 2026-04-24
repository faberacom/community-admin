"use client";

import { useState } from "react";
import { Modal } from "@/src/components/ui/modal";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { LoadingSpinner } from "@/src/components/ui/loading-spinner";

interface BanModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  onConfirm: (reason: string) => Promise<void>;
}

export function BanModal({ isOpen, onClose, username, onConfirm }: BanModalProps) {
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("Ban reason is required");
      return;
    }
    setIsLoading(true);
    try {
      await onConfirm(reason.trim());
      setReason("");
      setError("");
      onClose();
    } catch {
      setError("Failed to ban user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setReason("");
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Ban @${username}`} size="sm">
      <div className="p-6 space-y-4">
        <p className="text-sm text-gray-600">
          This will prevent{" "}
          <span className="font-semibold text-gray-900">@{username}</span> from
          accessing the platform. Please provide a reason.
        </p>
        <Textarea
          label="Ban reason"
          placeholder="e.g. Repeated violation of community guidelines"
          required
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (error) setError("");
          }}
          rows={3}
          maxLength={500}
          showCount
          error={error}
        />
        <div className="flex justify-end gap-3 pt-1">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <LoadingSpinner size="sm" className="border-white border-t-transparent" />
                Banning…
              </span>
            ) : (
              "Ban user"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
