interface ApprovalBadgeProps {
  isApproved: boolean;
  isDeleted: boolean;
}

export function ApprovalBadge({ isApproved, isDeleted }: ApprovalBadgeProps) {
  if (isDeleted) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
        Deleted
      </span>
    );
  }
  if (isApproved) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        Approved
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
      Pending
    </span>
  );
}
