import { BroadcastForm } from "@/src/components/broadcast/broadcast-form";

export default function BroadcastPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">Email Broadcast</h1>
        <p className="mt-1 text-sm text-gray-500">
          Send emails to platform users — use with caution
        </p>
      </div>
      <BroadcastForm />
    </div>
  );
}
