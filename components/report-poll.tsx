"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, X } from "lucide-react"

interface ReportPollProps {
  pollId: string
  pollTitle: string
  onClose: () => void
}

const REPORT_REASONS = [
  "Spam or fake content",
  "Harassment or hate speech",
  "Inappropriate content",
  "Copyright violation",
  "Misleading information",
  "Offensive language",
  "Other"
]

export function ReportPoll({ pollId, pollTitle, onClose }: ReportPollProps) {
  const [selectedReason, setSelectedReason] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReason) return

    setLoading(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pollId,
          reason: selectedReason,
          description: description.trim() || null
        })
      })

      if (res.ok) {
        setSubmitted(true)
      } else {
        throw new Error('Failed to submit report')
      }
    } catch (error) {
      console.error('Report submission failed:', error)
      alert('Failed to submit report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
              <AlertTriangle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Report Submitted</CardTitle>
            <CardDescription>
              Thank you for helping keep our community safe. We'll review your report shortly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span>Report Poll</span>
              </CardTitle>
              <CardDescription className="mt-2">
                Report: <span className="font-medium">"{pollTitle}"</span>
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Why are you reporting this poll? *
              </label>
              <div className="space-y-2">
                {REPORT_REASONS.map((reason) => (
                  <label key={reason} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="rounded"
                    />
                    <span className="text-sm">{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Additional details (optional)
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide any additional context about why you're reporting this poll..."
                rows={3}
              />
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!selectedReason || loading}
                className="flex-1"
              >
                {loading ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
