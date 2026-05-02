import Link from "next/link";
import { EventDetailView } from "@/src/components/events/event-detail-view";
import ChevronLeftIcon from "@/public/icons/chevron-left-icon.svg";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="max-w-7xl mx-auto">
      <Link
        href="/events"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        Back to Events
      </Link>

      <EventDetailView eventId={id} />
    </div>
  );
}
