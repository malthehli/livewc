'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Trophy, Calendar, Users, BarChart3, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Navigation({ leagueId }: { leagueId?: string }) {
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Fixtures', href: leagueId ? `/leagues/${leagueId}/fixtures` : '/dashboard', icon: Calendar },
    { name: 'Tournament', href: leagueId ? `/leagues/${leagueId}/tournament` : '/dashboard', icon: Trophy },
    { name: 'Standings', href: leagueId ? `/leagues/${leagueId}/group-rankings` : '/dashboard', icon: Users },
    { name: 'Leaderboard', href: leagueId ? `/leagues/${leagueId}/leaderboard` : '/dashboard', icon: BarChart3 },
  ]

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 flex h-16 items-center justify-around rounded-3xl border border-white/20 bg-white/80 px-2 shadow-2xl backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-900/80 md:relative md:bottom-0 md:left-0 md:right-0 md:flex-col md:h-screen md:w-24 md:rounded-none md:border-r md:border-t-0 md:px-0">
      <div className="hidden h-24 w-full items-center justify-center md:flex">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-600 to-yellow-500 shadow-lg shadow-orange-500/20">
          <Trophy size={20} className="text-white" />
        </div>
      </div>
      
      <div className="flex w-full flex-1 items-center justify-around md:flex-col md:justify-start md:gap-4 md:py-8">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex flex-col items-center justify-center transition-all duration-300 md:h-14 md:w-14 md:rounded-2xl",
                isActive ? "text-orange-600" : "text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              )}
            >
              {/* Active Indicator Background (Desktop) */}
              {isActive && (
                <div className="absolute inset-0 hidden rounded-2xl bg-orange-50 dark:bg-orange-950/30 md:block" />
              )}
              
              <div className={cn(
                "relative flex flex-col items-center gap-1 transition-transform duration-300",
                isActive ? "-translate-y-1" : "group-hover:-translate-y-1"
              )}>
                <Icon size={isActive ? 24 : 22} className={cn("transition-all", isActive && "drop-shadow-sm")} />
                {isActive && (
                  <span className="absolute -bottom-4 h-1 w-1 rounded-full bg-orange-600 md:hidden" />
                )}
              </div>
            </Link>
          )
        })}
      </div>

      <div className="hidden h-24 w-full items-center justify-center md:flex">
        <Link href="/settings" className="flex h-12 w-12 items-center justify-center rounded-2xl text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white">
          <Settings size={22} />
        </Link>
      </div>
    </nav>
  )
}
