"use client"

import { useState } from "react"
import { Copy } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { voteForOption } from "@/actions/poll-actions"
import type { PollWithOptions } from "@/types/database"

interface PollViewProps {
  poll: PollWithOptions
}

export function PollView({ poll }: PollViewProps) {
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    if (!selectedOption) {
      setError("Please select an option")
      return
    }

    setIsSubmitting(true)
    setError(null)

    formData.append("optionId", selectedOption)
    const result = await voteForOption(formData)

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    router.push(`/poll/${poll.id}/results`)
  }

  // Share link logic
  const [copied, setCopied] = useState(false)
  const pollUrl = typeof window !== "undefined"
    ? `${window.location.origin}/poll/${poll.id}`
    : ''

  const handleCopy = async () => {
    if (!pollUrl) return
    await navigator.clipboard.writeText(pollUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{poll.title}</CardTitle>
            {poll.description && <CardDescription>{poll.description}</CardDescription>}
          </div>
          <Button
            type="button"
            variant="ghost"
            className="flex items-center gap-2 text-sm"
            onClick={handleCopy}
            title="Copy poll link"
          >
            <Copy className="w-4 h-4" />
            {copied ? "Copied!" : "Share"}
          </Button>
        </div>
      </CardHeader>
      <form action={handleSubmit}>
        <CardContent>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">{error}</div>}

          <RadioGroup
            className="space-y-3"
            value={selectedOption ?? ""}
            onValueChange={setSelectedOption}
          >
            {poll.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem
                  id={option.id}
                  value={option.id}
                />
                <Label htmlFor={option.id} className="text-base">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="submit" disabled={isSubmitting || !selectedOption}>
            {isSubmitting ? "Submitting..." : "Submit Vote"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push(`/poll/${poll.id}/results`)}>
            View Results
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
