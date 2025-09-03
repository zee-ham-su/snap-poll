import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  // Prefer Next.js parsed URL when available (avoids re-parsing),
  // but fall back to constructing URL for test/mocked requests.
  const searchParams = (req as any).nextUrl?.searchParams ?? new URL(req.url).searchParams;
  const userId = searchParams.get("user_id");

  if (!userId) {
    return NextResponse.json({ polls: [] });
  }

  try {
    const { data, error } = await supabaseServer
      .from("polls")
      .select("id, title, description, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ polls: [] });
    }

    return NextResponse.json({ polls: data ?? [] });
  } catch {
    // In case of unexpected failures, preserve the existing behavior.
    return NextResponse.json({ polls: [] });
  }
}
