"use client";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { PollResults } from "@/components/poll-results";
import type { PollWithOptionsAndVotes } from "@/types/database";

export function PollResultsRealtime({ pollId, initialPoll }: { pollId: string, initialPoll: PollWithOptionsAndVotes }) {
  const [poll, setPoll] = useState(initialPoll);
  const supabase = getSupabaseClient();

  useEffect(() => {
    if (!pollId || !supabase) return;
    let ignore = false;
    const fetchPoll = async () => {
      const res = await fetch(`/api/poll-with-votes?id=${pollId}`);
      const data = await res.json();
      if (!ignore && data.poll) setPoll(data.poll);
    };
    // Subscribe to votes table for this poll
    const channel = supabase.channel(`votes-poll-${pollId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'votes' },
        () => {
          fetchPoll();
        }
      )
      .subscribe();
    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, [pollId, supabase]);

  return <PollResults poll={poll} />;
}
