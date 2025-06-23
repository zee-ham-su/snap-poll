import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { PollWithOptionsAndVotes } from "@/types/database"

interface PollResultsProps {
  poll: PollWithOptionsAndVotes
}

export function PollResults({ poll }: PollResultsProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">{poll.title}</CardTitle>
        {poll.description && <CardDescription>{poll.description}</CardDescription>}
        <p className="text-sm text-muted-foreground mt-2">Total votes: {poll.total_votes}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {poll.options.map((option) => {
          const percentage = poll.total_votes > 0 ? Math.round((option.votes / poll.total_votes) * 100) : 0

          return (
            <div key={option.id} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{option.text}</span>
                <span className="font-medium">
                  {percentage}% ({option.votes} votes)
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
