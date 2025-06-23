"use client"

import { useState, useEffect } from "react"
import { Search, Filter, SortAsc, SortDesc } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import type { PollCategory } from "@/types/database"

interface Poll {
  id: string
  title: string
  description: string | null
  category: string | null
  tags: string[] | null
  created_at: string
  total_votes: number
  options: Array<{ id: string; text: string }>
}

interface SearchResult {
  polls: Poll[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function PollSearch() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResult | null>(null)
  const [categories, setCategories] = useState<PollCategory[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Fetch categories
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

  // Search function
  const searchPolls = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        q: query,
        category,
        sortBy,
        page: page.toString(),
        limit: "10"
      })

      const res = await fetch(`/api/search?${params}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data)
      } else {
        console.error('Search failed')
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Auto-search on mount and when filters change
  useEffect(() => {
    searchPolls()
  }, [category, sortBy])

  // Handle search input with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== undefined) {
        searchPolls()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [query])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search polls by title or description..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="recent">Most Recent</option>
                  <option value="popular">Most Popular</option>
                  <option value="trending">Trending</option>
                  <option value="title">Title (A-Z)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4 w-2/3"></div>
                  <div className="flex space-x-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : results ? (
        <>
          {/* Results Header */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Found {results.pagination.total} polls
              {query && ` for "${query}"`}
            </p>
          </div>

          {/* Poll Cards */}
          <div className="space-y-4">
            {results.polls.map((poll) => (
              <Card key={poll.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        <Link 
                          href={`/poll/${poll.id}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {poll.title}
                        </Link>
                      </CardTitle>
                      {poll.description && (
                        <CardDescription className="mt-2">
                          {poll.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {poll.category && (
                      <Badge variant="secondary">{poll.category}</Badge>
                    )}
                    {poll.tags?.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{poll.options.length} options</span>
                    <span>{poll.total_votes} votes</span>
                    <span>{formatDate(poll.created_at)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {results.pagination.totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              {[...Array(results.pagination.totalPages)].map((_, i) => (
                <Button
                  key={i}
                  variant={results.pagination.page === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => searchPolls(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">Enter a search term to find polls</p>
        </div>
      )}
    </div>
  )
}
