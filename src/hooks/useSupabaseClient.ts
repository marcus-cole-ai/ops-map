/**
 * React hook for creating an authenticated Supabase client using Clerk session tokens.
 * 
 * This hook integrates Clerk authentication with Supabase's Row Level Security (RLS).
 * The Clerk session token is passed to Supabase via the accessToken callback,
 * allowing RLS policies to use `auth.jwt()->>'sub'` to get the Clerk user ID.
 * 
 * Prerequisites:
 * 1. Enable Clerk integration in Supabase dashboard (Authentication > Third-Party)
 * 2. Enable Supabase integration in Clerk dashboard (setup wizard)
 * 3. RLS policies must use `auth.jwt()->>'sub'` not `auth.uid()`
 */

'use client'

import { useSession } from '@clerk/nextjs'
import { useMemo } from 'react'
import { createClerkSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client'
import type { SupabaseClient, Database } from '@/lib/supabase/client'

export type { SupabaseClient, Database }

/**
 * Creates a Supabase client authenticated with the current Clerk session.
 * 
 * @returns Object containing:
 *   - client: The authenticated Supabase client (null if not configured or no session)
 *   - isReady: Whether the client is ready to use (session loaded and client created)
 *   - error: Any configuration error
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { client, isReady } = useSupabaseClient()
 *   
 *   useEffect(() => {
 *     if (!isReady || !client) return
 *     
 *     client.from('workspaces').select('*').then(({ data }) => {
 *       console.log('User workspaces:', data)
 *     })
 *   }, [client, isReady])
 * }
 * ```
 */
export function useSupabaseClient(): {
  client: SupabaseClient<Database> | null
  isReady: boolean
  error: string | null
} {
  const { session, isLoaded } = useSession()

  const result = useMemo(() => {
    // Check configuration
    if (!isSupabaseConfigured()) {
      return {
        client: null,
        isReady: true, // Ready, but no client - will use localStorage fallback
        error: 'Supabase not configured',
      }
    }

    // Wait for Clerk session to load
    if (!isLoaded) {
      return {
        client: null,
        isReady: false,
        error: null,
      }
    }

    // No session = not authenticated
    if (!session) {
      return {
        client: null,
        isReady: true,
        error: null, // Not an error, just not signed in
      }
    }

    // Create authenticated client
    try {
      const client = createClerkSupabaseClient(async () => {
        // getToken() returns null if not signed in or token expired
        return session.getToken() ?? null
      })

      return {
        client,
        isReady: true,
        error: null,
      }
    } catch (err) {
      return {
        client: null,
        isReady: true,
        error: err instanceof Error ? err.message : 'Failed to create Supabase client',
      }
    }
  }, [session, isLoaded])

  return result
}
