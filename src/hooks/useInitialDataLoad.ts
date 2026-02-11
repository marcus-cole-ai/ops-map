/**
 * Hook to load initial data from Supabase on app startup
 * 
 * Fetches user's workspace data from Supabase when authenticated
 * and populates the store. Handles merge with localStorage data.
 */

'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useOpsMapStore } from '@/store'
import { loadUserWorkspaces, mergeWorkspaces } from '@/lib/supabase/initialLoad'
import { supabase } from '@/lib/supabase/client'

type LoadState = 'idle' | 'loading' | 'loaded' | 'error'

/**
 * Load initial data from Supabase for the authenticated user
 */
export function useInitialDataLoad(userId: string | null): {
  loadState: LoadState
  reload: () => Promise<void>
} {
  const loadStateRef = useRef<LoadState>('idle')
  const loadedUserRef = useRef<string | null>(null)

  const {
    workspaces,
    syncEnabled,
    setSyncEnabled,
    setSyncStatus,
    markSynced,
  } = useOpsMapStore()

  // Internal setter to update state ref and re-render if needed
  const store = useOpsMapStore

  const loadFromSupabase = useCallback(async () => {
    if (!userId) return

    // Check if Supabase user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
    
    // If no Supabase session, skip loading from Supabase
    // User may be authenticated via Clerk but not Supabase
    if (!session) {
      console.log('No Supabase session, using localStorage only')
      loadStateRef.current = 'loaded'
      return
    }

    loadStateRef.current = 'loading'
    setSyncStatus('syncing')

    try {
      // Load workspaces from Supabase
      const supabaseWorkspaces = await loadUserWorkspaces(userId)

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

      loadStateRef.current = 'loaded'
      loadedUserRef.current = userId
    } catch (error) {
      console.error('Failed to load from Supabase:', error)
      setSyncStatus('error', error instanceof Error ? error.message : 'Failed to load data')
      loadStateRef.current = 'error'
      // Fall back to localStorage (already loaded via persist middleware)
    }
  }, [userId, setSyncStatus, setSyncEnabled, markSynced, store])

  // Load on mount/user change
  useEffect(() => {
    // Only load if user changed and not already loading
    if (userId && userId !== loadedUserRef.current && loadStateRef.current !== 'loading') {
      loadFromSupabase()
    }
  }, [userId, loadFromSupabase])

  return {
    loadState: loadStateRef.current,
    reload: loadFromSupabase,
  }
}
