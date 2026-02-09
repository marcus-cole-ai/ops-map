'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutGrid,
  GitBranch,
  Activity,
  Users,
  Briefcase,
  Monitor,
  Settings,
  AlertCircle,
  FileText,
  Network,
  PieChart,
  Menu,
  X,
} from 'lucide-react'
import { GlobalSearch } from '@/components/GlobalSearch'
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts'

const navigation = [
  { name: 'Function Chart', href: '/function-chart', icon: LayoutGrid },
  { name: 'Workflows', href: '/workflows', icon: GitBranch },
  { name: 'Core Activities', href: '/activities', icon: Activity },
  { name: 'Gap Analysis', href: '/gaps', icon: AlertCircle },
]

const resources = [
  { name: 'People', href: '/people', icon: Users },
  { name: 'Roles', href: '/roles', icon: Briefcase },
  { name: 'Software', href: '/software', icon: Monitor },
]

const tools = [
  { name: 'Coverage Report', href: '/tools/coverage', icon: PieChart },
  { name: 'Org Chart', href: '/tools/org-chart', icon: Network },
  { name: 'Job Descriptions', href: '/tools/job-description', icon: FileText },
  { name: 'Process Docs', href: '/tools/process-docs', icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Close sidebar when route changes (on mobile)
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Close sidebar on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'var(--gk-green)' }}>
            <LayoutGrid className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">
            <span style={{ color: 'var(--gk-green)' }}>Growth</span>
            <span className="text-white">Kits</span>
          </span>
        </Link>
        {/* Close button on mobile */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <GlobalSearch />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {/* Main */}
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-white'
                    : 'hover:text-white'
                )}
                style={{
                  background: isActive ? 'rgba(123, 157, 118, 0.3)' : 'transparent',
                  color: isActive ? 'white' : 'var(--stone)',
                }}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* Resources */}
        <div className="mt-6">
          <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Resources
          </div>
          <div className="space-y-1">
            {resources.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'text-white'
                      : 'hover:text-white'
                  )}
                  style={{
                    background: isActive ? 'rgba(123, 157, 118, 0.3)' : 'transparent',
                    color: isActive ? 'white' : 'var(--stone)',
                  }}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Tools */}
        <div className="mt-6">
          <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Tools
          </div>
          <div className="space-y-1">
            {tools.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'text-white'
                      : 'hover:text-white'
                  )}
                  style={{
                    background: isActive ? 'rgba(123, 157, 118, 0.3)' : 'transparent',
                    color: isActive ? 'white' : 'var(--stone)',
                  }}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Link
            href="/settings"
            onClick={() => setIsOpen(false)}
            className="flex-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-white"
            style={{ color: 'var(--stone)' }}
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>
          <KeyboardShortcuts />
        </div>
        <div className="px-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          GrowthKits © 2026
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Header with Hamburger */}
      <div 
        className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-14 px-4"
        style={{ background: 'var(--gk-charcoal)' }}
      >
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'var(--gk-green)' }}>
            <LayoutGrid className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold">
            <span style={{ color: 'var(--gk-green)' }}>Growth</span>
            <span className="text-white">Kits</span>
          </span>
        </Link>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <Menu className="h-6 w-6 text-white" />
        </button>
      </div>

      {/* Mobile spacer */}
      <div className="lg:hidden h-14" />

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-screen w-64 flex-col fixed left-0 top-0" style={{ background: 'var(--gk-charcoal)' }}>
        <SidebarContent />
      </div>

      {/* Desktop sidebar spacer */}
      <div className="hidden lg:block w-64 flex-shrink-0" />

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div 
        className={cn(
          "lg:hidden fixed top-0 left-0 bottom-0 z-50 w-64 flex flex-col transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ background: 'var(--gk-charcoal)' }}
      >
        <SidebarContent />
      </div>
    </>
  )
}
