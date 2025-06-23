"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Poll {
  id: string;
  title: string;
  description: string | null;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;

    const fetchPolls = async () => {
      setLoading(true);
      const response = await fetch(`/api/search/polls?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setPolls(data.polls || []);
      setLoading(false);
    };

    fetchPolls();
  }, [query]);

  if (!query) {
    return <div className="container py-10">Please enter a search query.</div>;
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Search Results for "{query}"</h1>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : polls.length === 0 ? (
        <div className="text-center">No polls found.</div>
      ) : (
        <ul className="space-y-4 max-w-2xl mx-auto">
          {polls.map((poll) => (
            <li key={poll.id} className="border rounded-lg p-4">
              <h2 className="font-bold text-lg">{poll.title}</h2>
              {poll.description && <p className="text-gray-600">{poll.description}</p>}
              <Button asChild variant="outline" size="sm" className="mt-2">
                <a href={`/poll/${poll.id}`}>View Poll</a>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
