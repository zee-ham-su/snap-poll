import { notFound } from "next/navigation"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { getPollWithVotes } from "@/actions/poll-actions"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface AnalyticsPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { id } = await params
  const poll = await getPollWithVotes(id)

  if (!poll) {
    notFound()
  }

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Poll Analytics</h1>
          <h2 className="text-xl text-muted-foreground mt-2">{poll.title}</h2>
        </div>
        <div className="flex space-x-2">
          <Button asChild variant="outline">
            <Link href={`/poll/${id}`}>View Poll</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/poll/${id}/results`}>View Results</Link>
          </Button>
        </div>
      </div>
      
      <AnalyticsDashboard pollId={id} />
    </div>
  )
}
