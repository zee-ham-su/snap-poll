"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Report {
  id: string;
  pollId: string;
  reason: string;
}

export default function ModerationPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      const response = await fetch("/api/admin/reports");
      const data = await response.json();
      setReports(data);
      setLoading(false);
    };

    fetchReports();
  }, []);

  const handleAction = async (reportId: string, action: string) => {
    const response = await fetch(`/api/admin/reports/${reportId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action }),
    });

    if (response.ok) {
      setReports((prev) => prev.filter((report) => report.id !== reportId));
    } else {
      alert("Failed to perform action. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Moderation Panel</h1>
      {reports.length === 0 ? (
        <p>No reports to review.</p>
      ) : (
        <ul className="space-y-4">
          {reports.map((report) => (
            <li key={report.id} className="border p-4 rounded-md">
              <p><strong>Poll ID:</strong> {report.pollId}</p>
              <p><strong>Reason:</strong> {report.reason}</p>
              <div className="flex gap-4 mt-4">
                <Button onClick={() => handleAction(report.id, "approve")}>
                  Approve
                </Button>
                <Button onClick={() => handleAction(report.id, "delete")} variant="destructive">
                  Delete
                </Button>
                <Button onClick={() => handleAction(report.id, "ignore")} variant="outline">
                  Ignore
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
