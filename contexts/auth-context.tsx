"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { getSupabaseClient } from "@/lib/supabase"

interface AuthContextType {
  user: any
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) return
    
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      setLoading(false)
    }
    
    getUser()
    
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      setUser(session?.user ?? null)
      setLoading(false)
    })
    
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    const supabase = getSupabaseClient()
    await supabase?.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
