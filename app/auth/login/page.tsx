"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import LoginForm from "@/components/LoginForm"

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Redirect authenticated users away from auth pages
  useEffect(() => {
    if (!loading && user) router.replace("/")
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (user) return null

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md p-6 bg-background border rounded-lg">
        <h1 className="text-xl font-semibold mb-4">Login</h1>
        <LoginForm />
      </div>
    </div>
  )
}
