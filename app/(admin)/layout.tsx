import { ProtectedRoute } from "@/src/components/auth/protected-route";
import { AdminLayout } from "@/src/components/layout/admin-layout";

export default function AdminRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}
