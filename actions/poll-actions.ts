"use server"

import { revalidatePath } from "next/cache"
import { supabaseServer } from "@/lib/supabase-server"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"
import type { Poll, PollWithOptions, PollWithOptionsAndVotes } from "@/types/database"

// Create a new poll with options
export async function createPoll(formData: FormData) {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const user_id = formData.get("user_id") as string | null
  const category = formData.get("category") as string | null
  const tagsString = formData.get("tags") as string | null
  const expires_at = formData.get("expires_at") as string | null
  const is_private = formData.get("is_private") === "true"
  const allow_multiple_votes = formData.get("allow_multiple_votes") === "true"

  // Parse tags
  let tags: string[] | null = null
  if (tagsString) {
    try {
      tags = JSON.parse(tagsString)
    } catch (error) {
      console.error("Error parsing tags:", error)
    }
  }

  // Get options from form data
  const optionsData: string[] = []
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("option-") && value) {
      optionsData.push(value as string)
    }
  }

  // Validate input
  if (!title || optionsData.length < 2) {
    return {
      error: "Title and at least two options are required",
    }
  }

  // Validate expiration date
  if (expires_at && new Date(expires_at) <= new Date()) {
    return {
      error: "Expiration date must be in the future",
    }
  }

  try {
    // Insert poll with new fields
    const { data: poll, error: pollError } = await supabaseServer
      .from("polls")
      .insert({ 
        title, 
        description, 
        user_id, 
        category: category || null,
        tags,
        expires_at: expires_at || null,
        is_private,
        allow_multiple_votes
      })
      .select()
      .single()

    if (pollError) throw pollError

    // Insert options
    const optionsToInsert = optionsData.map((text) => ({
      poll_id: poll.id,
      text,
    }))

    const { error: optionsError } = await supabaseServer.from("options").insert(optionsToInsert)

    if (optionsError) throw optionsError

    revalidatePath("/")
    return { success: true, pollId: poll.id }
  } catch (error) {
    console.error("Error creating poll:", error)
    return { error: "Failed to create poll" }
  }
}

// Get all polls
export async function getPolls(): Promise<Poll[]> {
  const { data, error } = await supabaseServer.from("polls").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching polls:", error)
    return []
  }

  return data || []
}

// Get a poll with its options
export async function getPoll(id: string): Promise<PollWithOptions | null> {
  const { data: poll, error: pollError } = await supabaseServer.from("polls").select("*").eq("id", id).single()

  if (pollError) {
    console.error("Error fetching poll:", pollError)
    return null
  }

  const { data: options, error: optionsError } = await supabaseServer
    .from("options")
    .select("*")
    .eq("poll_id", id)
    .order("created_at", { ascending: true })

  if (optionsError) {
    console.error("Error fetching options:", optionsError)
    return null
  }

  return {
    ...poll,
    options: options || [],
  }
}

// Get a poll with options and vote counts
export async function getPollWithVotes(id: string): Promise<PollWithOptionsAndVotes | null> {
  const { data: poll, error: pollError } = await supabaseServer.from("polls").select("*").eq("id", id).single()

  if (pollError) {
    console.error("Error fetching poll:", pollError)
    return null
  }

  const { data: options, error: optionsError } = await supabaseServer
    .from("options")
    .select("id, poll_id, text, created_at")
    .eq("poll_id", id)
    .order("created_at", { ascending: true })

  if (optionsError) {
    console.error("Error fetching options:", optionsError)
    return null
  }

  // Get vote counts for each option
  const optionsWithVotes = await Promise.all(
    options.map(async (option) => {
      const { count, error: voteError } = await supabaseServer
        .from("votes")
        .select("id", { count: "exact", head: true })
        .eq("option_id", option.id)

      if (voteError) {
        console.error("Error counting votes:", voteError)
        return { ...option, votes: 0 }
      }

      return { ...option, votes: count || 0 }
    }),
  )

  // Calculate total votes
  const totalVotes = optionsWithVotes.reduce((sum, option) => sum + option.votes, 0)

  return {
    ...poll,
    options: optionsWithVotes,
    total_votes: totalVotes,
  }
}

// Vote for an option
export async function voteForOption(formData: FormData) {
  const optionId = formData.get("optionId") as string

  if (!optionId) {
    return { error: "Option ID is required" }
  }

  try {
    // Get or create anonymous ID from cookies
    const cookieStore = await cookies()
    let anonymousId = cookieStore.get("anonymous_id")?.value
    if (!anonymousId) {
      anonymousId = uuidv4()
      cookieStore.set("anonymous_id", anonymousId, {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: "/",
      })
    }

    // Get poll ID for the option to redirect later
    const { data: option, error: optionError } = await supabaseServer
      .from("options")
      .select("poll_id")
      .eq("id", optionId)
      .single()

    if (optionError) throw optionError

    // Insert vote
    const { error: voteError } = await supabaseServer.from("votes").insert({
      option_id: optionId,
      anonymous_id: anonymousId,
    })

    if (voteError && voteError.code === "23505") {
      // Unique constraint violation - user already voted
      return { error: "You have already voted in this poll" }
    }

    if (voteError) throw voteError

    revalidatePath(`/poll/${option.poll_id}`)
    revalidatePath(`/poll/${option.poll_id}/results`)

    return { success: true, pollId: option.poll_id }
  } catch (error) {
    console.error("Error voting:", error)
    return { error: "Failed to register vote" }
  }
}
