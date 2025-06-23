import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pollId, reason, description } = body

    if (!pollId || !reason) {
      return NextResponse.json({ 
        error: "Poll ID and reason are required" 
      }, { status: 400 })
    }

    // Get user ID if authenticated, otherwise use anonymous ID
    const cookieStore = await cookies()
    let userId: string | null = null
    let anonymousId: string | null = null

    // Try to get authenticated user
    const { data: { user } } = await supabaseServer.auth.getUser()
    
    if (user) {
      userId = user.id
    } else {
      // Use or create anonymous ID
      anonymousId = cookieStore.get("anonymous_id")?.value
      if (!anonymousId) {
        anonymousId = uuidv4()
        cookieStore.set("anonymous_id", anonymousId, {
          maxAge: 60 * 60 * 24 * 365, // 1 year
          path: "/",
        })
      }
    }

    // Check if user/anonymous has already reported this poll
    let existingReportQuery = supabaseServer
      .from("poll_reports")
      .select("id")
      .eq("poll_id", pollId)

    if (userId) {
      existingReportQuery = existingReportQuery.eq("reporter_user_id", userId)
    } else {
      existingReportQuery = existingReportQuery.eq("reporter_anonymous_id", anonymousId)
    }

    const { data: existingReport } = await existingReportQuery.single()

    if (existingReport) {
      return NextResponse.json({ 
        error: "You have already reported this poll" 
      }, { status: 400 })
    }

    // Verify poll exists
    const { data: poll, error: pollError } = await supabaseServer
      .from("polls")
      .select("id, title")
      .eq("id", pollId)
      .single()

    if (pollError || !poll) {
      return NextResponse.json({ 
        error: "Poll not found" 
      }, { status: 404 })
    }

    // Insert report
    const { error: insertError } = await supabaseServer
      .from("poll_reports")
      .insert({
        poll_id: pollId,
        reporter_user_id: userId,
        reporter_anonymous_id: anonymousId,
        reason,
        description,
        status: "pending"
      })

    if (insertError) {
      console.error("Error inserting report:", insertError)
      return NextResponse.json({ 
        error: "Failed to submit report" 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: "Report submitted successfully" 
    })

  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 })
  }
}
