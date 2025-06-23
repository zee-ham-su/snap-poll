"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ReportPollPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pollId, setPollId] = useState<string | null>(null);

  useEffect(() => {
    params.then((resolvedParams) => {
      setPollId(resolvedParams.id);
    });
  }, [params]);

  const handleSubmit = async () => {
    if (!pollId) return;
    
    setIsSubmitting(true);

    const response = await fetch(`/api/polls/${pollId}/report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
    });

    if (response.ok) {
      alert("Report submitted successfully.");
      router.push(`/poll/${pollId}`);
    } else {
      alert("Failed to submit the report. Please try again.");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Report Poll</h1>
      <Textarea
        placeholder="Describe the issue with this poll..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full mb-4"
      />
      <div className="flex justify-center gap-4">
        <Button onClick={handleSubmit} disabled={isSubmitting || !reason || !pollId}>
          {isSubmitting ? "Submitting..." : "Submit Report"}
        </Button>
        <Button variant="outline" onClick={() => pollId && router.push(`/poll/${pollId}`)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
