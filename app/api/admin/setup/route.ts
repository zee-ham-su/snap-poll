import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userEmail, adminKey } = body

    // Check if the provided admin key matches the environment variable
    const expectedAdminKey = process.env.ADMIN_SETUP_KEY
    
    if (!expectedAdminKey) {
      return NextResponse.json({ 
        error: "Admin setup not configured on server" 
      }, { status: 500 })
    }

    if (adminKey !== expectedAdminKey) {
      return NextResponse.json({ 
        error: "Invalid admin key" 
      }, { status: 403 })
    }

    if (!userEmail) {
      return NextResponse.json({ 
        error: "Email is required" 
      }, { status: 400 })
    }

    // Find the user by email
    const { data: users, error: userError } = await supabaseServer
      .from("auth.users")
      .select("id")
      .eq("email", userEmail)
      .single()

    if (userError || !users) {
      return NextResponse.json({ 
        error: "User not found. Please ensure the user has signed up first." 
      }, { status: 404 })
    }

    // Check if user is already an admin
    const { data: existingAdmin, error: adminCheckError } = await supabaseServer
      .from("admin_users")
      .select("id")
      .eq("user_id", users.id)
      .single()

    if (existingAdmin) {
      return NextResponse.json({ 
        error: "User is already an admin" 
      }, { status: 400 })
    }

    // Make user an admin
    const { error: insertError } = await supabaseServer
      .from("admin_users")
      .insert({
        user_id: users.id,
        role: "admin",
        permissions: ["read", "write", "moderate", "analytics"]
      })

    if (insertError) {
      console.error("Error creating admin user:", insertError)
      return NextResponse.json({ 
        error: "Failed to create admin user" 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `User ${userEmail} has been made an admin` 
    })

  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 })
  }
}
