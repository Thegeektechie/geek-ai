'use client'

import {
  ArrowLeft,
  ArrowUpRight,
  Crown,
  MessageSquare,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useApp } from './app-provider'
import { GeekLogo } from './logo'
import { cn } from '@/lib/utils'

const STATS = [
  { label: 'Total Registered Users', value: '1,245', delta: '+12.4%', icon: Users },
  { label: 'Active Daily Users', value: '312', delta: '+3.1%', icon: TrendingUp },
  { label: 'Messages Today', value: '4,879', delta: '+18.2%', icon: MessageSquare },
  { label: 'Pro Subscribers', value: '86', delta: '+5.7%', icon: Crown },
]

const SIGNUPS = [
  { day: 'Mon', count: 24 },
  { day: 'Tue', count: 38 },
  { day: 'Wed', count: 31 },
  { day: 'Thu', count: 52 },
  { day: 'Fri', count: 47 },
  { day: 'Sat', count: 63 },
  { day: 'Sun', count: 41 },
]

const RECENT = [
  { name: 'Chidera Okafor', email: 'chidera@mail.com', persona: 'Developer', joined: '2 min ago', plan: 'Free' },
  { name: 'Aisha Bello', email: 'aisha.b@mail.com', persona: 'Job Hunter', joined: '18 min ago', plan: 'Pro' },
  { name: 'Tunde Adeyemi', email: 'tunde@mail.com', persona: 'Naija Vibes', joined: '44 min ago', plan: 'Free' },
  { name: 'Grace Musa', email: 'grace.m@mail.com', persona: 'General', joined: '1 hr ago', plan: 'Pro' },
  { name: 'David Ekwueme', email: 'david.e@mail.com', persona: 'Image Gen', joined: '2 hr ago', plan: 'Free' },
]

export function AdminDashboard() {
  const { setView } = useApp()
  const max = Math.max(...SIGNUPS.map((s) => s.count))

  return (
    <div className="ga-scroll h-dvh w-full overflow-y-auto bg-background">
      {/* header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur sm:px-6">
        <button
          type="button"
          onClick={() => setView('chat')}
          className="grid size-9 place-items-center rounded-xl border border-border text-foreground transition-colors hover:bg-muted"
          aria-label="Back to chat"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-xs text-muted-foreground">Geek-AI platform analytics</p>
        </div>
        <div className="ml-auto hidden sm:block">
          <GeekLogo size="sm" />
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {/* stat cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {STATS.map((s) => {
            const Icon = s.icon
            return (
              <div
                key={s.label}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-4.5 size-5" />
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <ArrowUpRight className="size-3.5" />
                    {s.delta}
                  </span>
                </div>
                <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">
                  {s.value}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
              </div>
            )
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* chart */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">New sign-ups</h2>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </div>
              <span className="text-sm font-bold text-foreground">
                {SIGNUPS.reduce((a, b) => a + b.count, 0)}
              </span>
            </div>
            <div className="flex h-44 items-end justify-between gap-2">
              {SIGNUPS.map((s) => (
                <div key={s.day} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t-md bg-primary/80 transition-all hover:bg-primary"
                      style={{ height: `${(s.count / max) * 100}%` }}
                      title={`${s.count} sign-ups`}
                    />
                  </div>
                  <span className="text-[11px] text-muted-foreground">{s.day}</span>
                </div>
              ))}
            </div>
          </section>

          {/* recent table */}
          <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:col-span-3">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">Recent sign-ups</h2>
              <p className="text-xs text-muted-foreground">Latest users to join Geek-AI</p>
            </div>
            <div className="ga-scroll overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3 font-medium">User</th>
                    <th className="px-5 py-3 font-medium">Persona</th>
                    <th className="px-5 py-3 font-medium">Joined</th>
                    <th className="px-5 py-3 font-medium">Plan</th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT.map((u) => (
                    <tr key={u.email} className="border-b border-border last:border-0">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="grid size-8 shrink-0 place-items-center rounded-lg text-xs font-semibold text-[var(--ga-accent-fg)]"
                            style={{ backgroundColor: 'var(--ga-accent)' }}
                          >
                            {u.name.charAt(0)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">{u.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{u.persona}</td>
                      <td className="px-5 py-3 text-muted-foreground">{u.joined}</td>
                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                            u.plan === 'Pro'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-muted-foreground',
                          )}
                        >
                          {u.plan}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
