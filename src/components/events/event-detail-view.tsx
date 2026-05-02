"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AdminEventDetail } from "@/src/types";
import { eventsService } from "@/src/services/events.service";
import { Button } from "@/src/components/ui/button";
import { ConfirmModal } from "@/src/components/ui/confirm-modal";
import { formatDate, formatDateTime } from "@/src/utils/date";
import PeopleIcon from "@/public/icons/people-icon.svg";
import GroupsIcon from "@/public/icons/groups.svg";
import BusinessIcon from "@/public/icons/business.svg";

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value.toLocaleString()}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

interface EventDetailViewProps {
  eventId: string;
}

export function EventDetailView({ eventId }: EventDetailViewProps) {
  const [event, setEvent] = useState<AdminEventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const router = useRouter();

  useEffect(() => {
    eventsService
      .getById(eventId)
      .then(setEvent)
      .catch(() => toast.error("Failed to load event"))
      .finally(() => setIsLoading(false));
  }, [eventId]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
          <div className="h-6 w-64 bg-gray-200 rounded" />
          <div className="h-4 w-32 bg-gray-100 rounded" />
          <div className="h-4 w-48 bg-gray-100 rounded" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-gray-50 rounded-xl h-20" />)}
        </div>
      </div>
    );
  }

  if (!event) {
    return <div className="text-center py-20 text-gray-400">Event not found.</div>;
  }

  const handleDelete = async () => {
    await eventsService.delete(event.id);
    toast.success(`"${event.title}" deleted`);
    router.push("/events");
  };

  const location = [event.address, event.city, event.state, event.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Main info card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900">{event.title}</h2>
              {event.isDeleted && (
                <span className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                  Deleted
                </span>
              )}
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${event.isOnline ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                {event.isOnline ? "Online" : "In-person"}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              by @{event.creator.username}
              {event.category && ` · ${event.category.charAt(0) + event.category.slice(1).toLowerCase()}`}
              {` · ${event.visibility === "PUBLIC" ? "Public" : event.visibility.charAt(0) + event.visibility.slice(1).toLowerCase()}`}
            </p>
          </div>
          {!event.isDeleted && (
            <Button variant="danger" size="sm" onClick={() => setShowDelete(true)}>
              Delete event
            </Button>
          )}
        </div>

        {event.description && (
          <p className="mt-4 text-sm text-gray-600">{event.description}</p>
        )}

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Start</p>
            <p className="text-gray-700">{formatDateTime(event.startTime)}</p>
          </div>
          {event.endTime && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">End</p>
              <p className="text-gray-700">{formatDateTime(event.endTime)}</p>
            </div>
          )}
          {location && (
            <div className="sm:col-span-2">
              <p className="text-xs text-gray-400 mb-0.5">Location</p>
              <p className="text-gray-700">{location}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Created</p>
            <p className="text-gray-500">{formatDate(event.createdAt)}</p>
          </div>
        </div>

        {/* Group / Business links */}
        {(event.groupId || event.businessId) && (
          <div className="mt-4 flex gap-2 flex-wrap">
            {event.groupId && (
              <Link
                href={`/groups/${event.groupId}`}
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
              >
                <GroupsIcon className="w-3.5 h-3.5" />
                View group
              </Link>
            )}
            {event.businessId && (
              <Link
                href={`/businesses/${event.businessId}`}
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
              >
                <BusinessIcon className="w-3.5 h-3.5" />
                View business
              </Link>
            )}
          </div>
        )}
      </div>

      {/* RSVP stats */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          RSVPs
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <StatBox label="Going" value={event.rsvps.going} color="text-green-600" />
          <StatBox label="Interested" value={event.rsvps.interested} color="text-amber-600" />
          <StatBox label="Not Going" value={event.rsvps.notGoing} color="text-gray-500" />
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          {event.rsvpCount.toLocaleString()} total RSVPs
        </p>
      </div>

      <ConfirmModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete event permanently"
        message={`This will permanently delete "${event.title}". This cannot be undone.`}
        confirmLabel="Delete permanently"
        variant="danger"
      />
    </div>
  );
}
