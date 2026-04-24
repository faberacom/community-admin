import Link from "next/link";
import { GroupDetailView } from "@/src/components/groups/group-detail-view";
import ChevronLeftIcon from "@/public/icons/chevron-left-icon.svg";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="max-w-7xl mx-auto">
      <Link
        href="/groups"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        Back to Groups
      </Link>

      <GroupDetailView groupId={id} />
    </div>
  );
}
