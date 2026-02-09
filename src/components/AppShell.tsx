'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { WelcomeModal } from '@/components/WelcomeModal'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      <WelcomeModal />
    </div>
  )
}
