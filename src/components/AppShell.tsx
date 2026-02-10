'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { WelcomeModal } from '@/components/WelcomeModal'
import { WorkspaceInitializer } from '@/components/WorkspaceInitializer'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceInitializer>
      <div className="flex min-h-screen" style={{ background: 'var(--cream)' }}>
        <Sidebar />
        <main className="flex-1 overflow-auto min-h-screen">
          {children}
        </main>
        <WelcomeModal />
      </div>
    </WorkspaceInitializer>
  )
}
