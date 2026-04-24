import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  description,
  children,
  className = "",
}: ChartCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 p-5 ${className}`}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export function ChartCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 p-5 animate-pulse ${className}`}
    >
      <div className="h-4 w-40 bg-gray-200 rounded mb-1" />
      <div className="h-3 w-56 bg-gray-100 rounded mb-5" />
      <div className="h-48 bg-gray-100 rounded-lg" />
    </div>
  );
}
