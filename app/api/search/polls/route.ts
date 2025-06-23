import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required." }, { status: 400 });
  }

  try {
    const { data: polls, error } = await supabaseServer
      .from("polls")
      .select("id, title, description")
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`);

    if (error) {
      throw error;
    }

    return NextResponse.json({ polls });
  } catch (error) {
    console.error("Error searching polls:", error);
    return NextResponse.json({ error: "Failed to search polls." }, { status: 500 });
  }
}
