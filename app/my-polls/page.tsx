"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Poll {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
}

export default function MyPollsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchPolls = async () => {
      if (!user) return;
      const res = await fetch(`/api/my-polls?user_id=${user.id}`);
      const data = await res.json();
      setPolls(data.polls || []);
      setIsLoading(false);
    };
    if (user) fetchPolls();
  }, [user]);

  if (loading || isLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">My Polls</h1>
      {polls.length === 0 ? (
        <div className="text-center text-gray-500">You haven't created any polls yet.</div>
      ) : (
        <ul className="space-y-4 max-w-2xl mx-auto">
          {polls.map((poll) => (
            <li key={poll.id} className="border rounded-lg p-4 flex flex-col gap-2">
              <div className="font-semibold text-lg">{poll.title}</div>
              {poll.description && <div className="text-gray-600">{poll.description}</div>}
              <Button asChild variant="outline" size="sm" className="w-fit mt-2">
                <a href={`/poll/${poll.id}`}>View Poll</a>
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className="text-center mt-8">
        <Button asChild>
          <a href="/create">Create New Poll</a>
        </Button>
      </div>
    </div>
  );
}
