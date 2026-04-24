import { CommentsView } from "@/src/components/content/comments-view";

export default function CommentsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">Comments</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage all platform comments — includes soft-deleted content
        </p>
      </div>
      <CommentsView />
    </div>
  );
}
