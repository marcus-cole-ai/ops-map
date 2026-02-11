import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export type { Database }

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing Supabase environment variables. ' +
    'Cloud sync will be disabled. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  )
}

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey)
}

/**
 * Create a Supabase client that uses Clerk session tokens for authentication.
 * This enables RLS policies to work with Clerk users via auth.jwt()->>'sub'.
 * 
 * @param getToken - Async function that returns the Clerk session token
 * @returns Authenticated Supabase client
 */
export function createClerkSupabaseClient(
  getToken: () => Promise<string | null>
): SupabaseClient<Database> {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables not configured')
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    accessToken: async () => {
      const token = await getToken()
      return token ?? ''
    },
  })
}

/**
 * Static Supabase client for use outside React components.
 * Note: This client has NO authentication context - use createClerkSupabaseClient
 * in React components where you have access to Clerk session.
 * 
 * This is useful for:
 * - Server-side operations with service role key
 * - Initial setup/migrations
 * - Operations that don't require user context
 * 
 * @deprecated Use createClerkSupabaseClient with Clerk session for authenticated operations
 */
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // No session persistence - we use Clerk
        autoRefreshToken: false,
      },
    })
  : null

export type { SupabaseClient }
