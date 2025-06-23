"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { createPoll } from "@/actions/poll-actions"
import { useAuth } from "@/contexts/auth-context"
import { Plus, Trash2, Calendar, Tag } from "lucide-react"
import type { PollCategory } from "@/types/database"

export function CreatePollForm() {
  const router = useRouter()
  const { user } = useAuth();
  const [options, setOptions] = useState(["", ""])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<PollCategory[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [expiresAt, setExpiresAt] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false)

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories')
        if (res.ok) {
          const data = await res.json()
          setCategories(data.categories || [])
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }
    fetchCategories()
  }, [])

  const addOption = () => {
    setOptions([...options, ""])
  }

  const removeOption = (index: number) => {
    if (options.length <= 2) return
    setOptions(options.filter((_, i) => i !== index))
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim() && !tags.includes(tagInput.trim())) {
      e.preventDefault()
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    setError(null)

    // Attach user_id to formData if logged in
    if (user?.id) {
      formData.append("user_id", user.id)
    }

    // Add tags, expiration, and other new fields
    if (tags.length > 0) {
      formData.append("tags", JSON.stringify(tags))
    }
    if (expiresAt) {
      formData.append("expires_at", expiresAt)
    }
    formData.append("is_private", isPrivate.toString())
    formData.append("allow_multiple_votes", allowMultipleVotes.toString())

    const result = await createPoll(formData)

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    router.push(`/poll/${result.pollId}`)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create a New Poll</CardTitle>
      </CardHeader>
      <form action={handleSubmit}>
        <CardContent className="space-y-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="title">Poll Question</Label>
            <Input id="title" name="title" placeholder="What's your favorite programming language?" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea id="description" name="description" placeholder="Add more context to your question..." rows={3} />
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select 
              id="category" 
              name="category" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name} - {category.description}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags (optional)</Label>
            <div className="space-y-2">
              <Input 
                placeholder="Add tags and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
              />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                      <button 
                        type="button" 
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Expiration Date */}
          <div className="space-y-2">
            <Label htmlFor="expires_at">Expiration Date (optional)</Label>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <input
                type="datetime-local"
                id="expires_at"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-sm text-gray-500">Poll will automatically close at this date and time</p>
          </div>

          {/* Poll Settings */}
          <div className="space-y-3">
            <Label>Poll Settings</Label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Private poll (only accessible via direct link)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={allowMultipleVotes}
                  onChange={(e) => setAllowMultipleVotes(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Allow multiple votes per user</span>
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Options</Label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  name={`option-${index}`}
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  required
                />
                {options.length > 2 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addOption} className="mt-2">
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Creating Poll..." : "Create Poll"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
