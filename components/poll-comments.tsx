"use client";
import { useEffect, useState, useRef } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Comment {
  id: string;
  poll_id: string;
  user_id: string | null;
  content: string;
  created_at: string;
}

export function PollComments({ pollId }: { pollId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseClient();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pollId || !supabase) return;
    let ignore = false;
    const fetchComments = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("comments")
        .select("*")
        .eq("poll_id", pollId)
        .order("created_at", { ascending: true });
      if (!ignore && data) setComments(data as unknown as Comment[]);
      setLoading(false);
    };
    fetchComments();
    // Real-time subscription
    const channel = supabase.channel(`comments-poll-${pollId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `poll_id=eq.${pollId}` },
        (payload) => {
          setComments((prev) => [...prev, payload.new as Comment]);
        }
      )
      .subscribe();
    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, [pollId, supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !supabase) return;
    await supabase.from("comments").insert({
      poll_id: pollId,
      user_id: user.id,
      content: newComment.trim(),
    });
    setNewComment("");
  };

  return (
    <div className="mt-8 max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold mb-2">Comments</h3>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 max-h-64 overflow-y-auto">
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : comments.length === 0 ? (
          <div className="text-center text-gray-500">No comments yet.</div>
        ) : (
          <ul className="space-y-2">
            {comments.map((c) => (
              <li key={c.id} className="border-b last:border-b-0 pb-2 text-sm">
                <span className="font-medium text-blue-700 dark:text-blue-300 mr-2">{c.user_id?.slice(0, 8) || "Anon"}:</span>
                {c.content}
                <span className="ml-2 text-xs text-gray-400">{new Date(c.created_at).toLocaleString()}</span>
              </li>
            ))}
            <div ref={bottomRef} />
          </ul>
        )}
      </div>
      {user && (
        <form onSubmit={handleSubmit} className="flex gap-2 mt-3">
          <Input
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1"
            maxLength={300}
          />
          <Button type="submit" disabled={!newComment.trim()}>Post</Button>
        </form>
      )}
      {!user && <div className="text-xs text-gray-500 mt-2">Sign in to comment.</div>}
    </div>
  );
}
