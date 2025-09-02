import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
  const offset = (page - 1) * limit;

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required." }, { status: 400 });
  }

  try {
    const { data: polls, error } = await supabaseServer
      .from("polls")
      .select("id, title, description")
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

  const res = NextResponse.json({ polls, page, limit });
  // Public cache for 30s, allow stale-while-revalidate
  res.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=120");
  return res;
  } catch (error) {
    console.error("Error searching polls:", error);
    return NextResponse.json({ error: "Failed to search polls." }, { status: 500 });
  }
}
