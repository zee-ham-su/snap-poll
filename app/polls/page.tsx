"use client"

import { PollSearch } from "@/components/poll-search"

export default function PollsPage() {
  return (
    <div className="container py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Discover Polls</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Search and explore polls from the community. Find trending topics, 
          browse by category, or search for specific interests.
        </p>
      </div>
      
      <PollSearch />
    </div>
  )
}
