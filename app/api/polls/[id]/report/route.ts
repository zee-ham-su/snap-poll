import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { reason } = await req.json();

  if (!reason) {
    return NextResponse.json({ error: "Reason is required." }, { status: 400 });
  }

  // Simulate saving the report to the database
  console.log(`Poll ${params.id} reported for: ${reason}`);

  return NextResponse.json({ message: "Report submitted successfully." });
}
