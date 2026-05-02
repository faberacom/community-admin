import { EventsView } from "@/src/components/events/events-view";

export default function EventsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage all platform events
        </p>
      </div>
      <EventsView />
    </div>
  );
}
