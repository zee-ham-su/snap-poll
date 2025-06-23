import { NextResponse } from "next/server";

// Simulated database of reports
const reports = [
  { id: "1", pollId: "123", reason: "Inappropriate content" },
  { id: "2", pollId: "456", reason: "Spam" },
];

export async function GET() {
  return NextResponse.json(reports);
}
