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
} from 'lucide-react'
import { GlobalSearch } from '@/components/GlobalSearch'

const navigation = [
  { name: 'Function Chart', href: '/function-chart', icon: LayoutGrid },
  { name: 'Workflows', href: '/workflows', icon: GitBranch },
  { name: 'Activities', href: '/activities', icon: Activity },
  { name: 'Gap Analysis', href: '/gaps', icon: AlertCircle },
  { name: 'People', href: '/people', icon: Users },
  { name: 'Roles', href: '/roles', icon: Briefcase },
  { name: 'Software', href: '/software', icon: Monitor },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col bg-slate-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">OpsMap</span>
        </Link>
      </div>

      {/* Search */}
      <div className="px-3 py-3 border-b border-slate-800">
        <GlobalSearch />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 p-4">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
        <div className="mt-2 px-3 text-xs text-slate-500">
          GrowthKits © 2026
        </div>
      </div>
    </div>
  )
}
