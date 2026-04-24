"use client";

import { useState } from "react";
import { Modal } from "@/src/components/ui/modal";
import { Button } from "@/src/components/ui/button";
import { Select } from "@/src/components/ui/select";
import { LoadingSpinner } from "@/src/components/ui/loading-spinner";
import { AdminRole, isSuperAdmin } from "@/src/types";
import { useAuthStore } from "@/src/stores";

interface ChangeRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  currentRole: AdminRole;
  targetRole: AdminRole;
  onConfirm: (role: AdminRole) => Promise<void>;
}

const roleOptions: { value: AdminRole; label: string }[] = [
  { value: "USER", label: "User" },
  { value: "ADMIN", label: "Admin" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
];

export function ChangeRoleModal({
  isOpen,
  onClose,
  username,
  currentRole,
  targetRole,
  onConfirm,
}: ChangeRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<AdminRole>(currentRole);
  const [isLoading, setIsLoading] = useState(false);
  const { user: currentAdmin } = useAuthStore();

  const canAssignSuperAdmin = isSuperAdmin(currentAdmin);

  const handleSubmit = async () => {
    if (selectedRole === currentRole) {
      onClose();
      return;
    }
    setIsLoading(true);
    try {
      await onConfirm(selectedRole);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setSelectedRole(currentRole);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Change role — @${username}`} size="sm">
      <div className="p-6 space-y-4">
        <p className="text-sm text-gray-600">
          Current role:{" "}
          <span className="font-semibold text-gray-900">{currentRole.replace("_", " ")}</span>
        </p>
        <Select
          label="New role"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as AdminRole)}
        >
          {roleOptions.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              disabled={opt.value === "SUPER_ADMIN" && !canAssignSuperAdmin}
            >
              {opt.label}
              {opt.value === "SUPER_ADMIN" && !canAssignSuperAdmin
                ? " (Super Admin only)"
                : ""}
            </option>
          ))}
        </Select>
        {selectedRole === "SUPER_ADMIN" && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            Granting Super Admin gives full platform control including role management.
          </p>
        )}
        <div className="flex justify-end gap-3 pt-1">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isLoading || selectedRole === currentRole}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <LoadingSpinner size="sm" className="border-white border-t-transparent" />
                Saving…
              </span>
            ) : (
              "Save role"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
