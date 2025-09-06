"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import LoginForm from "@/components/LoginForm"
import Link from "next/link"

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

/**
 * login function
 */

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
        <p className="mt-4 text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="underline">Create one</Link>
        </p>
      </div>
    </div>
  )
}
