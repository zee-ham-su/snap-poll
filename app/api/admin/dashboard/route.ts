import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  try {
    // Check if user is admin
    const { data: adminUser, error: adminError } = await supabaseServer
      .from("admin_users")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (adminError || !adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get overall platform statistics
    const [
      { count: totalPolls },
      { count: totalVotes },
      { count: totalUsers },
      { count: activePolls },
      { count: pendingReports }
    ] = await Promise.all([
      supabaseServer.from("polls").select("id", { count: "exact", head: true }),
      supabaseServer.from("votes").select("id", { count: "exact", head: true }),
      supabaseServer.from("polls").select("user_id", { count: "exact", head: true }).not("user_id", "is", null),
      supabaseServer.from("polls").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabaseServer.from("poll_reports").select("id", { count: "exact", head: true }).eq("status", "pending")
    ])

    // Get recent polls
    const { data: recentPolls, error: pollsError } = await supabaseServer
      .from("polls")
      .select(`
        id,
        title,
        created_at,
        is_active,
        category,
        user_id
      `)
      .order("created_at", { ascending: false })
      .limit(10)

    if (pollsError) {
      console.error("Error fetching recent polls:", pollsError)
    }

    // Get recent reports
    const { data: recentReports, error: reportsError } = await supabaseServer
      .from("poll_reports")
      .select(`
        id,
        reason,
        status,
        created_at,
        polls!inner(id, title)
      `)
      .order("created_at", { ascending: false })
      .limit(10)

    if (reportsError) {
      console.error("Error fetching recent reports:", reportsError)
    }

    // Get polls by category
    const { data: categoryStats, error: categoryError } = await supabaseServer
      .from("polls")
      .select("category")
      .not("category", "is", null)

    if (categoryError) {
      console.error("Error fetching category stats:", categoryError)
    }

    // Process category statistics
    const categoryMap = new Map()
    categoryStats?.forEach(poll => {
      const category = poll.category || 'Uncategorized'
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
    })

    const pollsByCategory = Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count
    }))

    const dashboard = {
      stats: {
        totalPolls: totalPolls || 0,
        totalVotes: totalVotes || 0,
        totalUsers: totalUsers || 0,
        activePolls: activePolls || 0,
        pendingReports: pendingReports || 0
      },
      recentPolls: recentPolls || [],
      recentReports: recentReports || [],
      pollsByCategory: pollsByCategory || [],
      userRole: adminUser.role,
      permissions: adminUser.permissions || []
    }

    return NextResponse.json({ dashboard })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, pollId, reportId, userId } = body

    // Check if user is admin
    const { data: adminUser, error: adminError } = await supabaseServer
      .from("admin_users")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (adminError || !adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    switch (action) {
      case "deactivate_poll":
        const { error: deactivateError } = await supabaseServer
          .from("polls")
          .update({ is_active: false })
          .eq("id", pollId)

        if (deactivateError) {
          return NextResponse.json({ error: "Failed to deactivate poll" }, { status: 500 })
        }
        break

      case "activate_poll":
        const { error: activateError } = await supabaseServer
          .from("polls")
          .update({ is_active: true })
          .eq("id", pollId)

        if (activateError) {
          return NextResponse.json({ error: "Failed to activate poll" }, { status: 500 })
        }
        break

      case "resolve_report":
        const { status } = body
        const { error: reportError } = await supabaseServer
          .from("poll_reports")
          .update({ 
            status, 
            reviewed_by: userId, 
            reviewed_at: new Date().toISOString() 
          })
          .eq("id", reportId)

        if (reportError) {
          return NextResponse.json({ error: "Failed to resolve report" }, { status: 500 })
        }
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
