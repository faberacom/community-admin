"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { broadcastService } from "@/src/services/broadcast.service";
import { analyticsService } from "@/src/services/analytics.service";
import { AdminRole, OverviewStats } from "@/src/types";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Select } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { Modal } from "@/src/components/ui/modal";
import { LoadingSpinner } from "@/src/components/ui/loading-spinner";
import { Switch } from "@/src/components/ui/switch";

function getEstimate(
  stats: OverviewStats | null,
  role: AdminRole | "",
  activeOnly: boolean,
): string {
  if (!stats) return "—";
  if (activeOnly) {
    return `~${stats.users.active.toLocaleString()} active users`;
  }
  return `~${stats.users.total.toLocaleString()} users`;
}

export function BroadcastForm() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [role, setRole] = useState<AdminRole | "">("");
  const [activeOnly, setActiveOnly] = useState(true);
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    analyticsService
      .getOverview()
      .then(setStats)
      .catch(() => {});
  }, []);

  const estimate = getEstimate(stats, role, activeOnly);
  const canSend = subject.trim().length > 0 && body.trim().length > 0;

  const handleSend = async () => {
    setIsSending(true);
    try {
      const result = await broadcastService.send({
        subject: subject.trim(),
        body: body.trim(),
        filter: {
          role: role || undefined,
          isActive: activeOnly ? true : undefined,
        },
      });
      toast.success(
        `Broadcast sent to ${result.sent.toLocaleString()} user${result.sent !== 1 ? "s" : ""}`,
      );
      setSubject("");
      setBody("");
      setRole("");
      setActiveOnly(true);
      setShowConfirm(false);
    } catch {
      toast.error("Failed to send broadcast");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <div className="max-w-2xl space-y-6">
        {/* Warning banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          <span className="font-semibold">Warning:</span> This will send a real
          email to all matching users. This action cannot be undone.
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1.5">
            Subject <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="e.g. Important update from Nigerian Community"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={200}
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1.5">
            Body <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-400 mb-2">
            HTML is supported — use{" "}
            <code className="bg-gray-100 px-1 rounded">&lt;p&gt;</code>,{" "}
            <code className="bg-gray-100 px-1 rounded">&lt;b&gt;</code>,{" "}
            <code className="bg-gray-100 px-1 rounded">&lt;a href&gt;</code>,
            etc.
          </p>
          <Textarea
            placeholder="<p>Dear community member,</p>"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
          />
        </div>

        {/* Audience filter */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">
            Audience filter
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Role
              </label>
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value as AdminRole | "")}
              >
                <option value="">All roles</option>
                <option value="USER">Users only</option>
                <option value="ADMIN">Admins only</option>
                <option value="SUPER_ADMIN">Super admins only</option>
              </Select>
            </div>

            <div className="flex items-center gap-3 pt-5">
              <Switch
                checked={activeOnly}
                onChange={(checked) => setActiveOnly(checked)}
              />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Active users only
                </p>
                <p className="text-xs text-gray-400">
                  Skip banned accounts
                </p>
              </div>
            </div>
          </div>

          {/* Estimate */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-gray-500">Estimated recipients:</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              {estimate}
            </span>
            <span className="text-xs text-gray-400">(approximate)</span>
          </div>
        </div>

        {/* Send button */}
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={() => setShowConfirm(true)}
            disabled={!canSend}
          >
            Review &amp; Send
          </Button>
          {!canSend && (
            <p className="text-xs text-gray-400">
              Subject and body are required.
            </p>
          )}
        </div>
      </div>

      {/* Confirmation modal */}
      <Modal
        isOpen={showConfirm}
        onClose={() => !isSending && setShowConfirm(false)}
        title="Confirm broadcast"
        size="sm"
      >
        <div className="p-6 space-y-4">
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Subject</p>
              <p className="font-medium text-gray-900 break-words">{subject}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Recipients</p>
              <p className="font-semibold text-gray-900">{estimate}</p>
            </div>
            {role && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Role filter</p>
                <p className="text-gray-700">{role.replace("_", " ")}</p>
              </div>
            )}
          </div>

          <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
            This will immediately send emails to all matching users. This cannot
            be undone.
          </p>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirm(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSend}
              disabled={isSending}
            >
              {isSending ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" className="border-white border-t-transparent" />
                  Sending…
                </span>
              ) : (
                "Send broadcast"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
