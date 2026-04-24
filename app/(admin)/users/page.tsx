import { UsersView } from "@/src/components/users/users-view";

export default function UsersPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage platform users — search, filter, ban, and change roles
        </p>
      </div>
      <UsersView />
    </div>
  );
}
