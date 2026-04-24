import { AdminRole } from "@/src/types";

interface RoleBadgeProps {
  role: AdminRole;
}

const styles: Record<AdminRole, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-700",
  ADMIN: "bg-blue-100 text-blue-700",
  USER: "bg-gray-100 text-gray-600",
};

const labels: Record<AdminRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  USER: "User",
};

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[role]}`}
    >
      {labels[role]}
    </span>
  );
}
