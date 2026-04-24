import Link from "next/link";
import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  subText?: string;
  icon: ReactNode;
  iconBg?: string;
  href?: string;
  badge?: {
    text: string;
    variant: "red" | "amber" | "green" | "blue";
  };
}

const badgeStyles = {
  red: "bg-red-100 text-red-700",
  amber: "bg-amber-100 text-amber-700",
  green: "bg-green-100 text-green-700",
  blue: "bg-blue-100 text-blue-700",
};

function CardContent({
  label,
  value,
  subText,
  icon,
  iconBg = "bg-primary/10",
  badge,
}: StatCardProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 font-medium truncate">{label}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <p className="text-2xl font-bold text-gray-900">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {badge && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${badgeStyles[badge.variant]}`}
            >
              {badge.text}
            </span>
          )}
        </div>
        {subText && (
          <p className="mt-1 text-xs text-gray-400 leading-relaxed">{subText}</p>
        )}
      </div>
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ml-4 ${iconBg}`}
      >
        {icon}
      </div>
    </div>
  );
}

export function StatCard(props: StatCardProps) {
  const base =
    "bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow";

  if (props.href) {
    return (
      <Link href={props.href} className={`${base} block`}>
        <CardContent {...props} />
      </Link>
    );
  }

  return (
    <div className={base}>
      <CardContent {...props} />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-7 w-16 bg-gray-200 rounded mt-2" />
          <div className="h-3 w-32 bg-gray-100 rounded mt-2" />
        </div>
        <div className="w-11 h-11 rounded-xl bg-gray-100 ml-4" />
      </div>
    </div>
  );
}
