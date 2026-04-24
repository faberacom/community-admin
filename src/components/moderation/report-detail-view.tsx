"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { moderationService } from "@/src/services/moderation.service";
import {
  Report,
  ReportStatus,
  ModerationActionType,
  TargetType,
} from "@/src/types";
import { Button } from "@/src/components/ui/button";
import { ConfirmModal } from "@/src/components/ui/confirm-modal";
import { formatDate, formatDateTime } from "@/src/utils/date";
import { ReportStatusBadge } from "./report-status-badge";
import { TargetTypeBadge } from "./target-type-badge";
import { ActionModal } from "./action-modal";

const reasonLabels: Record<string, string> = {
  SPAM: "Spam",
  HARASSMENT: "Harassment",
  HATE: "Hate Speech",
  MISINFORMATION: "Misinformation",
  OTHER: "Other",
};

const actionLabels: Record<ModerationActionType, string> = {
  WARN: "Warn User",
  DELETE_POST: "Delete Post",
  DELETE_COMMENT: "Delete Comment",
  BAN_USER: "Ban User",
  FEATURE_BUSINESS: "Feature Business",
  UNFEATURE_BUSINESS: "Unfeature Business",
};

function getActionsForTargetType(targetType: TargetType): ModerationActionType[] {
  switch (targetType) {
    case "POST":
      return ["DELETE_POST", "WARN"];
    case "COMMENT":
      return ["DELETE_COMMENT", "WARN"];
    case "USER":
      return ["BAN_USER", "WARN"];
    case "BUSINESS":
      return ["FEATURE_BUSINESS", "UNFEATURE_BUSINESS"];
    case "GROUP":
      return [];
  }
}

interface TargetContentProps {
  targetType: TargetType;
  target: unknown;
}

function TargetContent({ targetType, target }: TargetContentProps) {
  if (!target) {
    return (
      <p className="text-sm text-gray-400 italic">
        Content snapshot not available.
      </p>
    );
  }

  const data = target as Record<string, string | boolean | Record<string, string>>;

  if (targetType === "POST") {
    return (
      <div className="space-y-1">
        {data.content && (
          <p className="text-sm text-gray-800">{String(data.content)}</p>
        )}
        {data.postType && (
          <p className="text-xs text-gray-400">
            Type: {String(data.postType)} · Visibility:{" "}
            {String(data.visibility ?? "—")}
          </p>
        )}
        {data.isDeleted && (
          <p className="text-xs text-red-500 font-medium">
            (This post has been deleted)
          </p>
        )}
      </div>
    );
  }

  if (targetType === "COMMENT") {
    return (
      <div className="space-y-1">
        {data.content && (
          <p className="text-sm text-gray-800">{String(data.content)}</p>
        )}
        {data.isDeleted && (
          <p className="text-xs text-red-500 font-medium">
            (This comment has been deleted)
          </p>
        )}
      </div>
    );
  }

  if (targetType === "USER") {
    const profile = data.profile as Record<string, string> | undefined;
    return (
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-800">
          @{String(profile?.username ?? data.username ?? "—")}
        </p>
        {(profile?.displayName || data.displayName) && (
          <p className="text-xs text-gray-500">
            {String(profile?.displayName ?? data.displayName)}
          </p>
        )}
        <p className="text-xs text-gray-400">{String(data.email ?? "—")}</p>
        {!data.isActive && (
          <p className="text-xs text-red-500 font-medium">(User is banned)</p>
        )}
      </div>
    );
  }

  if (targetType === "BUSINESS") {
    return (
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-800">
          {String(data.name ?? "—")}
        </p>
        {data.description && (
          <p className="text-xs text-gray-500 line-clamp-2">
            {String(data.description)}
          </p>
        )}
        {data.category && (
          <p className="text-xs text-gray-400">
            Category: {String(data.category)}
          </p>
        )}
      </div>
    );
  }

  if (targetType === "GROUP") {
    return (
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-800">
          {String(data.name ?? "—")}
        </p>
        {data.description && (
          <p className="text-xs text-gray-500 line-clamp-2">
            {String(data.description)}
          </p>
        )}
      </div>
    );
  }

  return null;
}

interface ReportDetailViewProps {
  reportId: string;
}

export function ReportDetailView({ reportId }: ReportDetailViewProps) {
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState<ModerationActionType | null>(null);
  const [showDismiss, setShowDismiss] = useState(false);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    moderationService
      .getById(reportId)
      .then(setReport)
      .catch(() => toast.error("Failed to load report"))
      .finally(() => setIsLoading(false));
  }, [reportId]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
          <div className="h-5 w-32 bg-gray-200 rounded" />
          <div className="h-4 w-48 bg-gray-100 rounded" />
          <div className="h-4 w-40 bg-gray-100 rounded" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 h-24" />
        <div className="bg-white rounded-2xl border border-gray-100 p-6 h-16" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-20 text-gray-400">Report not found.</div>
    );
  }

  const availableActions = getActionsForTargetType(report.targetType);
  const isResolved =
    report.status === "RESOLVED" || report.status === "DISMISSED";

  const handleAction = async (
    actionType: ModerationActionType,
    notes?: string,
  ) => {
    const updated = await moderationService.takeAction(
      report.id,
      actionType,
      notes,
    );
    setReport(updated);
    toast.success(`Action "${actionLabels[actionType]}" taken successfully`);
  };

  const handleStatusUpdate = async (status: ReportStatus) => {
    const updated = await moderationService.updateStatus(report.id, status);
    setReport(updated);
    toast.success(`Report marked as ${status.toLowerCase().replace("_", " ")}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Report meta */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <TargetTypeBadge type={report.targetType} />
            <ReportStatusBadge status={report.status} />
          </div>
          <p className="text-xs text-gray-400">
            Reported {formatDate(report.createdAt)}
          </p>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Reason</p>
            <p className="font-medium text-gray-800">
              {reasonLabels[report.reason] ?? report.reason}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Reporter</p>
            <p className="font-medium text-gray-800">
              @{report.reporterUsername}
            </p>
          </div>
          {report.description && (
            <div className="sm:col-span-2">
              <p className="text-xs text-gray-400 mb-0.5">Description</p>
              <p className="text-gray-700">{report.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Reported content */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Reported Content
        </h3>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <TargetContent targetType={report.targetType} target={report.target} />
        </div>
      </div>

      {/* Actions */}
      {!isResolved && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Actions
          </h3>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <div className="flex flex-wrap gap-2">
              {availableActions.map((action) => (
                <Button
                  key={action}
                  variant={
                    action === "BAN_USER" ||
                    action === "DELETE_POST" ||
                    action === "DELETE_COMMENT"
                      ? "danger"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => setPendingAction(action)}
                >
                  {actionLabels[action]}
                </Button>
              ))}
              {report.status === "OPEN" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReview(true)}
                >
                  Mark Under Review
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDismiss(true)}
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Action history */}
      {report.actions.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Action History
          </h3>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <ol className="relative border-l border-gray-200 space-y-5 ml-2">
              {report.actions.map((action) => (
                <li key={action.id} className="ml-4">
                  <div className="absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full bg-primary border-2 border-white" />
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {actionLabels[action.actionType] ?? action.actionType}
                      </p>
                      <p className="text-xs text-gray-400">
                        by @{action.adminUsername}
                      </p>
                      {action.notes && (
                        <p className="text-xs text-gray-500 mt-1 italic">
                          "{action.notes}"
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDateTime(action.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Action modal */}
      {pendingAction && (
        <ActionModal
          isOpen={true}
          onClose={() => setPendingAction(null)}
          actionType={pendingAction}
          onConfirm={handleAction}
        />
      )}

      {/* Dismiss confirm */}
      <ConfirmModal
        isOpen={showDismiss}
        onClose={() => setShowDismiss(false)}
        onConfirm={() => handleStatusUpdate("DISMISSED")}
        title="Dismiss report"
        message="This will mark the report as dismissed. No action will be taken against the reported content."
        confirmLabel="Dismiss"
        variant="default"
      />

      {/* Under review confirm */}
      <ConfirmModal
        isOpen={showReview}
        onClose={() => setShowReview(false)}
        onConfirm={() => handleStatusUpdate("UNDER_REVIEW")}
        title="Mark under review"
        message="This will mark the report as under review, indicating you are investigating it."
        confirmLabel="Mark Under Review"
        variant="default"
      />
    </div>
  );
}
