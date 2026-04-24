import { PostsView } from "@/src/components/content/posts-view";

export default function PostsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage all platform posts — includes soft-deleted content
        </p>
      </div>
      <PostsView />
    </div>
  );
}
