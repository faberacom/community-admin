import { GroupsView } from "@/src/components/groups/groups-view";

export default function GroupsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage groups and review pending approval requests
        </p>
      </div>
      <GroupsView />
    </div>
  );
}
