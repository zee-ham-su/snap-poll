import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export async function GET() {
  try {
    const { data: categories, error } = await supabaseServer
      .from("poll_categories")
      .select("*")
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching categories:", error)
      return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
    }

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, color } = body

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    const { data: category, error } = await supabaseServer
      .from("poll_categories")
      .insert({
        name,
        description,
        color
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating category:", error)
      return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
    }

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
