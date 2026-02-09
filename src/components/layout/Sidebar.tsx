'use client'

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

  return (
    <div className="flex h-screen w-64 flex-col" style={{ background: 'var(--gk-charcoal)' }}>
      {/* Logo */}
      <div className="flex h-16 items-center justify-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'var(--gk-green)' }}>
            <LayoutGrid className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">
            <span style={{ color: 'var(--gk-green)' }}>Growth</span>
            <span className="text-white">Kits</span>
          </span>
        </Link>
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
    </div>
  )
}
