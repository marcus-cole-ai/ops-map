'use client'

import { useEffect, useRef, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useOpsMapStore } from '@/store'
import { useInitialDataLoad } from '@/hooks/useInitialDataLoad'

/**
 * This component initializes the workspace for the current user.
 * It runs once when the user signs in and:
 * 1. Loads workspace data from Supabase (if authenticated)
 * 2. Filters workspaces to only show the user's workspaces
 * 3. Creates a default workspace if the user has none
 * 4. Switches to the user's most recent workspace
 */
export function WorkspaceInitializer({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()
  const initialized = useRef(false)
  const [ready, setReady] = useState(false)
  
  const {
    workspaces,
    activeWorkspaceId,
    switchWorkspace,
    setCurrentUserId,
    getUserWorkspaces,
    createWorkspaceForUser,
    syncStatus,
  } = useOpsMapStore()

  // Load data from Supabase when user is authenticated
  const { loadState } = useInitialDataLoad(user?.id ?? null)

  useEffect(() => {
    // Wait for auth to load and Supabase initial load to complete (or fail)
    if (!isLoaded || !user) return
    if (loadState === 'loading') return // Still loading from Supabase
    if (initialized.current) return
    
    initialized.current = true
    const userId = user.id

    // Set the current user ID in the store
    setCurrentUserId(userId)

    // Get workspaces for this user (may include newly loaded Supabase data)
    const userWorkspaces = getUserWorkspaces(userId)

    if (userWorkspaces.length === 0) {
      // Create a default workspace for new users
      const newWorkspace = createWorkspaceForUser('My Company', userId)
      switchWorkspace(newWorkspace.id)
    } else {
      // Check if active workspace belongs to this user
      const activeWs = userWorkspaces.find(ws => ws.id === activeWorkspaceId)
      if (!activeWs) {
        // Switch to user's first workspace
        switchWorkspace(userWorkspaces[0].id)
      }
    }
    
    setReady(true)
  }, [isLoaded, user, loadState, workspaces, activeWorkspaceId, switchWorkspace, setCurrentUserId, getUserWorkspaces, createWorkspaceForUser])

  // Mark ready if we've initialized (handles race conditions)
  useEffect(() => {
    if (initialized.current && !ready) {
      setReady(true)
    }
  }, [ready, workspaces])

  // Don't render until user is loaded and initialization is complete
  if (!isLoaded || (user && loadState === 'loading')) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--cream)' }}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="animate-pulse text-lg" style={{ color: 'var(--text-secondary)' }}>
            {loadState === 'loading' ? 'Loading your workspaces...' : 'Loading...'}
          </div>
          {syncStatus === 'syncing' && (
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Syncing with cloud...
            </div>
          )}
        </div>
      </div>
    )
  }

  return <>{children}</>
}
