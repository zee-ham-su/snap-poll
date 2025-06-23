"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Users, Eye } from "lucide-react"
import type { PollAnalytics } from "@/types/database"

interface AnalyticsDashboardProps {
  pollId: string
}

export function AnalyticsDashboard({ pollId }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<PollAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/analytics?pollId=${pollId}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch analytics')
        }

        setAnalytics(data.analytics)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (pollId) {
      fetchAnalytics()
    }
  }, [pollId])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p>Failed to load analytics: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analytics) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Votes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_votes}</div>
          </CardContent>
        </Card>

        {/* Unique Voters */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Voters</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.unique_voters}</div>
          </CardContent>
        </Card>

        {/* Total Views */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_views}</div>
          </CardContent>
        </Card>

        {/* Unique Viewers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Viewers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.unique_viewers}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.total_views > 0 ? 
                `${Math.round((analytics.unique_viewers / analytics.total_views) * 100)}% conversion` 
                : 'No views yet'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Votes by Option */}
      <Card>
        <CardHeader>
          <CardTitle>Votes by Option</CardTitle>
          <CardDescription>Breakdown of votes for each option</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {analytics.votes_by_option.map((option) => {
            const percentage = analytics.total_votes > 0 
              ? Math.round((option.votes / analytics.total_votes) * 100) 
              : 0

            return (
              <div key={option.option_id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{option.option_text}</span>
                  <span className="text-muted-foreground">
                    {option.votes} votes ({percentage}%)
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Voting Timeline */}
      {analytics.votes_over_time.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Voting Activity (Last 30 Days)</CardTitle>
            <CardDescription>Daily vote counts over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.votes_over_time.map((day) => (
                <div key={day.date} className="flex justify-between items-center text-sm">
                  <span>{new Date(day.date).toLocaleDateString()}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.max(10, (day.count / Math.max(...analytics.votes_over_time.map(d => d.count))) * 100)}%` 
                        }}
                      />
                    </div>
                    <span className="w-8 text-right">{day.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
