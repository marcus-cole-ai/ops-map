'use client'

import { useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { useOpsMapStore } from '@/store'

/**
 * This component initializes the workspace for the current user.
 * It runs once when the user signs in and:
 * 1. Filters workspaces to only show the user's workspaces
 * 2. Creates a default workspace if the user has none
 * 3. Switches to the user's most recent workspace
 */
export function WorkspaceInitializer({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()
  const initialized = useRef(false)
  
  const {
    workspaces,
    activeWorkspaceId,
    switchWorkspace,
    setCurrentUserId,
    getUserWorkspaces,
    createWorkspaceForUser,
  } = useOpsMapStore()

  useEffect(() => {
    if (!isLoaded || !user || initialized.current) return
    
    initialized.current = true
    const userId = user.id

    // Set the current user ID in the store
    setCurrentUserId(userId)

    // Get workspaces for this user
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
  }, [isLoaded, user, workspaces, activeWorkspaceId, switchWorkspace, setCurrentUserId, getUserWorkspaces, createWorkspaceForUser])

  // Don't render anything until user is loaded
  if (!isLoaded) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--cream)' }}
      >
        <div className="animate-pulse text-lg" style={{ color: 'var(--text-secondary)' }}>
          Loading...
        </div>
      </div>
    )
  }

  return <>{children}</>
}
