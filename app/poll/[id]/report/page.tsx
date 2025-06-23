"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ReportPollPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const response = await fetch(`/api/polls/${params.id}/report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
    });

    if (response.ok) {
      alert("Report submitted successfully.");
      router.push(`/poll/${params.id}`);
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
        <Button onClick={handleSubmit} disabled={isSubmitting || !reason}>
          {isSubmitting ? "Submitting..." : "Submit Report"}
        </Button>
        <Button variant="outline" onClick={() => router.push(`/poll/${params.id}`)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
