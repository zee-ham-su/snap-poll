import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")
  const category = searchParams.get("category")
  const sortBy = searchParams.get("sortBy") || "created_at"
  const order = searchParams.get("order") || "desc"
  const limit = parseInt(searchParams.get("limit") || "20")
  const page = parseInt(searchParams.get("page") || "1")

  try {
    let queryBuilder = supabaseServer
      .from("polls")
      .select(`
        *,
        options(id, text),
        votes:options(votes(*))
      `)
      .eq("is_active", true)

    // Add search filter
    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    }

    // Add category filter
    if (category && category !== "all") {
      queryBuilder = queryBuilder.eq("category", category)
    }

    // Handle different sort options
    switch (sortBy) {
      case "popular":
        // This is approximate - would need a more complex query for exact vote counts
        queryBuilder = queryBuilder.order("created_at", { ascending: false })
        break
      case "recent":
        queryBuilder = queryBuilder.order("created_at", { ascending: false })
        break
      case "trending":
        // Trending = recent polls with activity (simplified)
        queryBuilder = queryBuilder
          .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order("created_at", { ascending: false })
        break
      default:
        queryBuilder = queryBuilder.order(sortBy, { ascending: order === "asc" })
    }

    // Add pagination
    const offset = (page - 1) * limit
    queryBuilder = queryBuilder.range(offset, offset + limit - 1)

    const { data: polls, error } = await queryBuilder

    if (error) {
      console.error("Error searching polls:", error)
      return NextResponse.json({ error: "Failed to search polls" }, { status: 500 })
    }

    // Calculate vote counts for each poll
    const pollsWithVotes = polls?.map(poll => {
      const totalVotes = poll.options?.reduce((sum: number, option: any) => {
        return sum + (option.votes?.length || 0)
      }, 0) || 0

      return {
        ...poll,
        total_votes: totalVotes,
        votes: undefined // Remove the nested votes data
      }
    }) || []

    // Get total count for pagination
    let countQuery = supabaseServer
      .from("polls")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)

    if (query) {
      countQuery = countQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    }

    if (category && category !== "all") {
      countQuery = countQuery.eq("category", category)
    }

    const { count } = await countQuery

    return NextResponse.json({
      polls: pollsWithVotes,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
