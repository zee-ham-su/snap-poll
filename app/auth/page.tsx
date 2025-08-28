"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

// Redirect /auth to /auth/login to use the new split pages.
export default function AuthIndexRedirect() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (user) router.replace("/")
    else router.replace("/auth/login")
  }, [loading, user, router])

  return null
}
