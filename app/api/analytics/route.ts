import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const pollId = searchParams.get("pollId")

  if (!pollId) {
    return NextResponse.json({ error: "Poll ID is required" }, { status: 400 })
  }

  try {
    // Get basic poll analytics using the database function
    const { data: stats, error: statsError } = await supabaseServer
      .rpc('get_poll_stats', { poll_uuid: pollId })

    if (statsError) {
      console.error("Error fetching poll stats:", statsError)
      return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
    }

    // Get votes over time (last 30 days)
    const { data: votesOverTime, error: votesError } = await supabaseServer
      .from("votes")
      .select(`
        created_at,
        options!inner(poll_id)
      `)
      .eq("options.poll_id", pollId)
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: true })

    if (votesError) {
      console.error("Error fetching votes over time:", votesError)
      return NextResponse.json({ error: "Failed to fetch vote timeline" }, { status: 500 })
    }

    // Get votes by option
    const { data: votesByOption, error: optionsError } = await supabaseServer
      .from("options")
      .select(`
        id,
        text,
        votes!left(id)
      `)
      .eq("poll_id", pollId)

    if (optionsError) {
      console.error("Error fetching votes by option:", optionsError)
      return NextResponse.json({ error: "Failed to fetch option breakdown" }, { status: 500 })
    }

    // Process votes over time data
    const votesTimelineMap = new Map()
    votesOverTime?.forEach(vote => {
      const date = vote.created_at.split('T')[0] // Get date only
      votesTimelineMap.set(date, (votesTimelineMap.get(date) || 0) + 1)
    })

    const votesTimeline = Array.from(votesTimelineMap.entries()).map(([date, count]) => ({
      date,
      count
    }))

    // Process votes by option data
    const optionBreakdown = votesByOption?.map(option => ({
      option_id: option.id,
      option_text: option.text,
      votes: option.votes?.length || 0
    })) || []

    const analytics = {
      ...stats[0],
      votes_over_time: votesTimeline,
      votes_by_option: optionBreakdown
    }

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
