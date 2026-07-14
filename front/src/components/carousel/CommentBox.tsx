"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";

import { addComment, fetchComments } from "@/lib/videos";
import { useStoredUser } from "@/hooks/useStoredUser";
import type { Comment, CommentBoxProps } from "@/types";

export function CommentBox({
  videoId,
  commentsCount,
  onCommentAdded,
  variant = "light",
}: CommentBoxProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const { user } = useStoredUser();
  const isDark = variant === "dark";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchComments(videoId);
      setItems(data.items);
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const text = body.trim();
    if (!text || posting) return;

    setPosting(true);
    try {
      const comment = await addComment(videoId, text);
      setItems((prev) => [comment, ...prev].slice(0, 5));
      setBody("");
      onCommentAdded();
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className={`border-t pt-3 ${isDark ? "border-white/10" : "border-border"}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`text-xs font-medium ${isDark ? "text-white" : "text-foreground"}`}
      >
        {open ? "Hide" : "View"} comments ({commentsCount})
      </button>

      {open ? (
        <div className="mt-2 space-y-2">
          {loading ? (
            <p className={`text-xs ${isDark ? "text-white/60" : "text-muted"}`}>
              Loading comments…
            </p>
          ) : items.length === 0 ? (
            <p className={`text-xs ${isDark ? "text-white/60" : "text-muted"}`}>
              No comments yet.
            </p>
          ) : (
            <ul className="max-h-28 space-y-1 overflow-y-auto">
              {items.map((c) => (
                <li
                  key={c.id}
                  className={`text-xs ${isDark ? "text-white/70" : "text-muted"}`}
                >
                  {c.body}
                </li>
              ))}
            </ul>
          )}

          {user ? (
            <form onSubmit={(e) => void handleSubmit(e)} className="flex gap-2">
              <input
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Add a comment…"
                maxLength={1000}
                className={`min-w-0 flex-1 rounded-md border px-2 py-1 text-xs ${
                  isDark
                    ? "border-white/15 bg-white/10 text-white placeholder:text-white/40"
                    : "border-border"
                }`}
              />
              <button
                type="submit"
                disabled={posting || !body.trim()}
                className={`rounded-md px-2 py-1 text-xs disabled:opacity-50 ${
                  isDark
                    ? "bg-white text-black"
                    : "bg-foreground text-background"
                }`}
              >
                Post
              </button>
            </form>
          ) : (
            <p className={`text-xs ${isDark ? "text-white/60" : "text-muted"}`}>
              <Link
                href="/login"
                className={isDark ? "text-white underline" : "underline"}
              >
                Log in
              </Link>{" "}
              to comment.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
