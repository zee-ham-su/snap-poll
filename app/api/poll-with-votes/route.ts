import { NextRequest, NextResponse } from "next/server";
import { getPollWithVotes } from "@/actions/poll-actions";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ poll: null });
  const poll = await getPollWithVotes(id);
  return NextResponse.json({ poll });
}
