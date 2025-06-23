import { notFound } from "next/navigation"
import { PollView } from "@/components/poll-view"
import { getPoll } from "@/actions/poll-actions"

interface PollPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PollPage({ params }: PollPageProps) {
  const { id } = await params
  const poll = await getPoll(id)

  if (!poll) {
    notFound()
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Vote in Poll</h1>
      <PollView poll={poll} />
    </div>
  )
}
