import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");
  if (!user_id) {
    return NextResponse.json({ polls: [] });
  }
  const { data, error } = await supabaseServer
    .from("polls")
    .select("id, title, description, created_at")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });
  if (error) {
    return NextResponse.json({ polls: [] });
  }
  return NextResponse.json({ polls: data });
}
