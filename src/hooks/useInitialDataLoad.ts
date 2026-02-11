/**
 * Hook to load initial data from Supabase on app startup
 * 
 * Fetches user's workspace data from Supabase when authenticated via Clerk
 * and populates the store. Handles merge with localStorage data.
 * 
 * Uses the new Clerk-Supabase third-party auth integration:
 * - Clerk session token is passed to Supabase via accessToken callback
 * - RLS policies use auth.jwt()->>'sub' to identify the Clerk user
 */

'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useOpsMapStore } from '@/store'
import { useSupabaseClient } from './useSupabaseClient'
import { loadUserWorkspacesWithClient, mergeWorkspaces } from '@/lib/supabase/initialLoad'

export type LoadState = 'idle' | 'loading' | 'loaded' | 'error'

/**
 * Load initial data from Supabase for the authenticated user
 */
export function useInitialDataLoad(userId: string | null): {
  loadState: LoadState
  reload: () => Promise<void>
} {
  const [loadState, setLoadState] = useState<LoadState>('idle')
  const loadedUserRef = useRef<string | null>(null)
  
  const { client, isReady, error: clientError } = useSupabaseClient()

  const {
    setSyncEnabled,
    setSyncStatus,
    markSynced,
  } = useOpsMapStore()

  const store = useOpsMapStore

  const loadFromSupabase = useCallback(async () => {
    // No user = nothing to load
    if (!userId) {
      setLoadState('idle')
      return
    }

    // Client not ready yet
    if (!isReady) {
      return
    }

    // No client = Supabase not configured or no session
    if (!client) {
      if (clientError) {
        console.log('Supabase client error:', clientError)
      } else {
        console.log('Supabase not available, using localStorage only')
      }
      setLoadState('loaded') // Mark as loaded so UI doesn't wait forever
      return
    }

    setLoadState('loading')
    setSyncStatus('syncing')

    try {
      // Load workspaces from Supabase using authenticated client
      const supabaseWorkspaces = await loadUserWorkspacesWithClient(client, userId)

      if (supabaseWorkspaces.length > 0) {
        // Merge with local workspaces
        const currentWorkspaces = store.getState().workspaces
        const merged = mergeWorkspaces(currentWorkspaces, supabaseWorkspaces, userId)

        // Update store with merged workspaces
        store.setState({ workspaces: merged })

        // Enable sync since we successfully loaded from Supabase
        setSyncEnabled(true)
        markSynced()
        console.log(`Loaded ${supabaseWorkspaces.length} workspace(s) from Supabase`)
      } else {
        // No workspaces in Supabase - user might be new
        // Keep localStorage data and enable sync for future saves
        setSyncEnabled(true)
        markSynced()
        console.log('No workspaces in Supabase, using localStorage')
      }

      setLoadState('loaded')
      loadedUserRef.current = userId
    } catch (error) {
      console.error('Failed to load from Supabase:', error)
      setSyncStatus('error', error instanceof Error ? error.message : 'Failed to load data')
      setLoadState('error')
      // Fall back to localStorage (already loaded via persist middleware)
    }
  }, [userId, client, isReady, clientError, setSyncStatus, setSyncEnabled, markSynced, store])

  // Load on mount/user change
  useEffect(() => {
    // Only load if:
    // - We have a user
    // - Client is ready
    // - We haven't already loaded for this user
    // - We're not currently loading
    if (
      userId && 
      isReady && 
      userId !== loadedUserRef.current && 
      loadState !== 'loading'
    ) {
      loadFromSupabase()
    }
  }, [userId, isReady, loadState, loadFromSupabase])

  return {
    loadState,
    reload: loadFromSupabase,
  }
}
