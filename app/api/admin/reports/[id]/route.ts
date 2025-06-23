import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { action } = await req.json();

  if (!action) {
    return NextResponse.json({ error: "Action is required." }, { status: 400 });
  }

  // Simulate handling the action (approve, delete, ignore)
  console.log(`Report ${params.id} action: ${action}`);

  return NextResponse.json({ message: "Action performed successfully." });
}
