import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PollResultsRealtime } from "@/components/poll-results-realtime"
import { PollComments } from "@/components/poll-comments"
import { getPollWithVotes } from "@/actions/poll-actions"

interface ResultsPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { id } = await params
  const poll = await getPollWithVotes(id)

  if (!poll) {
    notFound()
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Poll Results</h1>

      <PollResultsRealtime pollId={poll.id} initialPoll={poll} />
      <PollComments pollId={poll.id} />

      <div className="flex justify-center mt-8 gap-4">
        <Button asChild variant="outline">
          <Link href={`/poll/${id}`}>Back to Poll</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/poll/${id}/analytics`}>View Analytics</Link>
        </Button>
        <Button asChild>
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  )
}
