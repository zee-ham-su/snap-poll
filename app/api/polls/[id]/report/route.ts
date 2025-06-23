import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { reason } = await request.json();
  const params = await context.params;

  if (!reason) {
    return NextResponse.json({ error: "Reason is required." }, { status: 400 });
  }

  // Simulate saving the report to the database
  console.log(`Poll ${params.id} reported for: ${reason}`);

  return NextResponse.json({ message: "Report submitted successfully." });
}
