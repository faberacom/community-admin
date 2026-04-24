import { TargetType } from "@/src/types";

const styles: Record<TargetType, string> = {
  POST: "bg-blue-100 text-blue-700",
  COMMENT: "bg-indigo-100 text-indigo-700",
  USER: "bg-purple-100 text-purple-700",
  BUSINESS: "bg-teal-100 text-teal-700",
  GROUP: "bg-amber-100 text-amber-700",
};

export function TargetTypeBadge({ type }: { type: TargetType }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${styles[type]}`}
    >
      {type}
    </span>
  );
}
