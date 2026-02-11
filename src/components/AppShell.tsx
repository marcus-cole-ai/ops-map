'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { WelcomeModal } from '@/components/WelcomeModal'
import { WorkspaceInitializer } from '@/components/WorkspaceInitializer'
import { OfflineBanner } from '@/components/OfflineBanner'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceInitializer>
      <div className="flex flex-col min-h-screen" style={{ background: 'var(--cream)' }}>
        <OfflineBanner />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 overflow-auto min-h-0">
            {children}
          </main>
        </div>
        <WelcomeModal />
      </div>
    </WorkspaceInitializer>
  )
}
