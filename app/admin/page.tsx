"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { AdminDashboard } from "@/components/admin-dashboard"

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="container py-10">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container py-10">
      <AdminDashboard />
    </div>
  )
}
