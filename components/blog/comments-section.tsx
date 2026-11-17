import { getApprovedComments } from "@/lib/comments";
import { formatDate } from "@/lib/format";
import { CommentForm } from "./comment-form";

export async function CommentsSection({ postId }: { postId: string }) {
  const comments = await getApprovedComments(postId);

  return (
    <section className="mt-14">
      <h2 className="font-heading text-2xl font-bold">
        Comments{comments.length > 0 ? ` (${comments.length})` : ""}
      </h2>

      {comments.length > 0 && (
        <ul className="mt-6 space-y-4">
          {comments.map((c) => (
            <li key={c.id} className="rounded-xl border border-border bg-surface p-5">
              <p className="font-heading font-semibold">
                {c.name}
                <span className="ml-3 font-mono text-xs font-normal text-muted">
                  {formatDate(c.createdAt)}
                </span>
              </p>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted">
                {c.body}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 rounded-xl border border-border bg-surface p-6">
        <h3 className="font-heading font-semibold">Leave a comment</h3>
        <p className="mb-4 mt-1 text-sm text-muted">
          Comments are reviewed before they appear.
        </p>
        <CommentForm postId={postId} />
      </div>
    </section>
  );
}