"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"

export default function AuthForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    const supabase = getSupabaseClient()
    if (!supabase) {
      setMessage("Supabase client not initialized")
      setLoading(false)
      return
    }
    
    try {
      if (mode === "sign-in") {
        const { data } = await supabase.auth.signInWithPassword({ email, password })
        if (data.user) {
          setMessage("Signed in successfully!")
          // Wait a bit for auth context to update, then redirect
          setTimeout(() => {
            router.push("/")
            router.refresh() // Force a refresh to update auth state
          }, 500)
        }
      } else {
        const { data } = await supabase.auth.signUp({ email, password })
        if (data.user) {
          if (data.user.email_confirmed_at) {
            // Email confirmed immediately (confirmation disabled)
            setMessage("Account created successfully!")
            setTimeout(() => {
              router.push("/")
              router.refresh()
            }, 500)
          } else {
            // Email confirmation required
            setMessage("Check your email for a confirmation link!")
          }
        }
      }
    } catch {
      setMessage("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleAuth} className="space-y-4 max-w-sm mx-auto">
      <h2 className="text-xl font-semibold text-center mb-2">
        {mode === "sign-in" ? "Sign In" : "Sign Up"}
      </h2>
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      {message && <div className="text-green-600 text-sm">{message}</div>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Loading..." : mode === "sign-in" ? "Sign In" : "Sign Up"}
      </Button>
      <div className="text-center text-sm mt-2">
        {mode === "sign-in" ? (
          <span>
            Don&apos;t have an account?{' '}
            <button type="button" className="underline" onClick={() => setMode("sign-up")}>Sign Up</button>
          </span>
        ) : (
          <span>
            Already have an account?{' '}
            <button type="button" className="underline" onClick={() => setMode("sign-in")}>Sign In</button>
          </span>
        )}
      </div>
    </form>
  )
}
