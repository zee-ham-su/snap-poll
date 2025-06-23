"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import AuthForm from "@/components/auth-form"
import { useAuth } from "@/contexts/auth-context"

export default function AuthPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (!loading && user) {
      router.push("/")
    }
  }, [user, loading, router])

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is logged in, don't show the form
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
        <AuthForm />
      </div>
    </div>
  )
}
