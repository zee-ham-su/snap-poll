"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  Users, 
  Vote, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Calendar,
  Activity
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface AdminDashboardData {
  stats: {
    totalPolls: number
    totalVotes: number
    totalUsers: number
    activePolls: number
    pendingReports: number
  }
  recentPolls: Array<{
    id: string
    title: string
    created_at: string
    is_active: boolean
    category: string | null
    user_id: string | null
  }>
  recentReports: Array<{
    id: string
    reason: string
    status: string
    created_at: string
    polls: { id: string; title: string }
  }>
  pollsByCategory: Array<{
    category: string
    count: number
  }>
  userRole: string
  permissions: string[]
}

export function AdminDashboard() {
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user?.id) return

      try {
        setLoading(true)
        const res = await fetch(`/api/admin/dashboard?userId=${user.id}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch dashboard')
        }

        setDashboard(data.dashboard)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [user?.id])

  const handleAdminAction = async (action: string, targetId: string, additionalData?: any) => {
    try {
      const res = await fetch('/api/admin/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          pollId: action.includes('poll') ? targetId : undefined,
          reportId: action.includes('report') ? targetId : undefined,
          userId: user?.id,
          ...additionalData
        })
      })

      if (!res.ok) {
        throw new Error('Action failed')
      }

      // Refresh dashboard data
      window.location.reload()
    } catch (err) {
      console.error('Admin action failed:', err)
      alert('Action failed. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!dashboard) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage polls, users, and monitor platform activity
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Role: {dashboard.userRole}
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Polls</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.stats.totalPolls}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.stats.totalVotes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Polls</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.stats.activePolls}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dashboard.stats.pendingReports}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Polls */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Polls</CardTitle>
            <CardDescription>Latest polls created on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.recentPolls.map((poll) => (
                <div key={poll.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium truncate">{poll.title}</h4>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(poll.created_at).toLocaleDateString()}</span>
                      {poll.category && (
                        <Badge variant="outline" className="text-xs">
                          {poll.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={poll.is_active ? "default" : "secondary"}>
                      {poll.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      size="sm"
                      variant={poll.is_active ? "destructive" : "default"}
                      onClick={() => 
                        handleAdminAction(
                          poll.is_active ? "deactivate_poll" : "activate_poll", 
                          poll.id
                        )
                      }
                    >
                      {poll.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>User reports requiring review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.recentReports.map((report) => (
                <div key={report.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{report.polls.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Reason: {report.reason}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(report.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        report.status === "pending" ? "destructive" :
                        report.status === "approved" ? "default" : "secondary"
                      }
                    >
                      {report.status}
                    </Badge>
                  </div>
                  {report.status === "pending" && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => 
                          handleAdminAction("resolve_report", report.id, { status: "approved" })
                        }
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => 
                          handleAdminAction("resolve_report", report.id, { status: "rejected" })
                        }
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Polls by Category */}
      {dashboard.pollsByCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Polls by Category</CardTitle>
            <CardDescription>Distribution of polls across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {dashboard.pollsByCategory.map((category) => (
                <div key={category.category} className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{category.count}</div>
                  <div className="text-sm text-muted-foreground">{category.category}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
