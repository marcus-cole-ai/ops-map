/**
 * Supabase Context
 * 
 * Provides an authenticated Supabase client throughout the app.
 * The client uses Clerk session tokens for authentication, enabling
 * RLS policies to work with Clerk users.
 * 
 * Usage:
 * 1. Wrap your app with <SupabaseProvider>
 * 2. Use useSupabase() hook to get the client in components
 * 3. Use getSupabaseClient() for sync operations outside React
 */

'use client'

import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react'
import { useSession } from '@clerk/nextjs'
import { createClerkSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client'
import type { SupabaseClient, Database } from '@/lib/supabase/client'

interface SupabaseContextValue {
  client: SupabaseClient<Database> | null
  isReady: boolean
  error: string | null
}

const SupabaseContext = createContext<SupabaseContextValue>({
  client: null,
  isReady: false,
  error: null,
})

// Global reference for sync operations outside React components
let globalClient: SupabaseClient<Database> | null = null

/**
 * Get the current Supabase client outside of React components.
 * Returns null if not initialized or no session.
 */
export function getSupabaseClient(): SupabaseClient<Database> | null {
  return globalClient
}

interface SupabaseProviderProps {
  children: ReactNode
}

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  const { session, isLoaded } = useSession()
  const clientRef = useRef<SupabaseClient<Database> | null>(null)
  const [state, setState] = React.useState<SupabaseContextValue>({
    client: null,
    isReady: false,
    error: null,
  })

  useEffect(() => {
    // Check configuration
    if (!isSupabaseConfigured()) {
      setState({
        client: null,
        isReady: true,
        error: 'Supabase not configured',
      })
      globalClient = null
      return
    }

    // Wait for Clerk session to load
    if (!isLoaded) {
      return
    }

    // No session = not authenticated
    if (!session) {
      setState({
        client: null,
        isReady: true,
        error: null,
      })
      globalClient = null
      return
    }

    // Create authenticated client if we don't have one
    if (!clientRef.current) {
      try {
        clientRef.current = createClerkSupabaseClient(async () => {
          return session.getToken() ?? null
        })
        
        globalClient = clientRef.current
        
        setState({
          client: clientRef.current,
          isReady: true,
          error: null,
        })
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to create Supabase client'
        setState({
          client: null,
          isReady: true,
          error: errorMsg,
        })
        globalClient = null
      }
    } else {
      // Client already exists, just update state
      setState({
        client: clientRef.current,
        isReady: true,
        error: null,
      })
    }

    // Cleanup on session change
    return () => {
      // Don't cleanup immediately - session might just be refreshing
    }
  }, [session, isLoaded])

  // Reset client when session changes (e.g., sign out)
  useEffect(() => {
    if (isLoaded && !session) {
      clientRef.current = null
      globalClient = null
    }
  }, [isLoaded, session])

  return (
    <SupabaseContext.Provider value={state}>
      {children}
    </SupabaseContext.Provider>
  )
}

/**
 * Hook to access the authenticated Supabase client.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { client, isReady, error } = useSupabase()
 *   
 *   if (!isReady) return <Loading />
 *   if (error) return <Error message={error} />
 *   if (!client) return <SignIn /> // No session
 *   
 *   // Use client for database operations
 *   const { data } = await client.from('workspaces').select()
 * }
 * ```
 */
export function useSupabase(): SupabaseContextValue {
  return useContext(SupabaseContext)
}
