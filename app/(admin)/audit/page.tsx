import { AuditView } from "@/src/components/audit/audit-view";

export default function AuditPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track all admin actions across the platform
        </p>
      </div>
      <AuditView />
    </div>
  );
}
