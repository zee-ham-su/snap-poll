import { NextResponse } from "next/server"

// Health check to ensure the service role key is present on the server.
// Do NOT expose any secret values. Consider removing or protecting this route in production.
export async function GET() {
  // Do not expose this endpoint in production environments
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 })
  }

  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!hasUrl || !hasServiceRole) {
    return NextResponse.json(
      {
        ok: false,
        error: "Supabase environment variables missing on server",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    )
  }

  return NextResponse.json(
    { ok: true, message: "Supabase server key is configured (not exposed)." },
    { headers: { "Cache-Control": "no-store" } },
  )
}
