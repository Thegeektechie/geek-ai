'use client'

import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  MessageSquarePlus,
  Settings,
  Sparkles,
  Zap,
} from 'lucide-react'
import { PERSONAS, getPersona } from '@/lib/geek-ai'
import { useApp } from './app-provider'
import { GeekLogo } from './logo'
import { Menu, MenuItem } from './menu'
import { DarkModeToggle, ThemeSelector } from './theme-controls'
import { cn } from '@/lib/utils'

function ProfileMenu() {
  const { user, signOut, setView, toast } = useApp()
  const initial = user?.name?.charAt(0).toUpperCase() ?? 'G'

  return (
    <Menu
      align="start"
      panelClassName="w-[15rem]"
      trigger={(open) => (
        <span className="flex items-center gap-2.5 rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-2 transition-colors hover:bg-sidebar-accent">
          <span
            className="grid size-9 shrink-0 place-items-center rounded-lg text-sm font-semibold text-[var(--ga-accent-fg)]"
            style={{ backgroundColor: 'var(--ga-accent)' }}
          >
            {initial}
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate text-sm font-medium text-sidebar-foreground">
              {user?.name ?? 'Guest'}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {user?.email ?? ''}
            </span>
          </span>
          <ChevronDown
            className={`size-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </span>
      )}
    >
      {(close) => (
        <>
          <MenuItem onClick={() => { toast('Settings will be added soon.', 'info'); close() }}>
            <Settings className="size-4 text-muted-foreground" />
            Settings
          </MenuItem>
          <MenuItem onClick={() => { toast('Billing will be added soon.', 'info'); close() }}>
            <Zap className="size-4 text-muted-foreground" />
            Billing &amp; plans
          </MenuItem>
          {/* Hidden admin entry */}
          <MenuItem onClick={() => { setView('admin'); close() }}>
            <LayoutDashboard className="size-4 text-muted-foreground" />
            Admin dashboard
          </MenuItem>
          <div className="my-1 h-px bg-border" />
          <MenuItem onClick={() => { signOut(); close() }} className="text-destructive hover:bg-destructive/10">
            <LogOut className="size-4" />
            Sign out
          </MenuItem>
        </>
      )}
    </Menu>
  )
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const {
    conversations,
    activeId,
    persona,
    newChat,
    selectConversation,
    setPersona,
    chatLimit,
    chatsRemaining,
  } = useApp()

  const pct = Math.round((chatsRemaining / chatLimit) * 100)

  return (
    <div className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground">
      {/* header */}
      <div className="flex items-center justify-between p-3">
        <GeekLogo size="sm" />
      </div>

      <div className="px-3">
        <ProfileMenu />
      </div>

      {/* new chat */}
      <div className="p-3">
        <button
          type="button"
          onClick={() => {
            newChat()
            onNavigate?.()
          }}
          className="flex w-full items-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <MessageSquarePlus className="size-4" />
          New chat
        </button>
      </div>

      {/* personas quick switch */}
      <div className="px-3 pb-2">
        <p className="px-1 pb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Personas
        </p>
        <div className="grid grid-cols-4 gap-1.5">
          {PERSONAS.map((p) => {
            const Icon = p.icon
            const isActive = p.id === persona
            return (
              <button
                key={p.id}
                type="button"
                title={p.name}
                aria-label={p.name}
                onClick={() => setPersona(p.id)}
                className={cn(
                  'grid aspect-square place-items-center rounded-lg border transition-colors',
                  isActive
                    ? 'border-transparent'
                    : 'border-sidebar-border text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground',
                )}
                style={
                  isActive
                    ? { backgroundColor: 'var(--ga-accent)', color: 'var(--ga-accent-fg)' }
                    : undefined
                }
              >
                <Icon className="size-4" />
              </button>
            )
          })}
        </div>
        <p className="mt-1.5 px-1 text-xs text-muted-foreground">
          Active: <span className="text-sidebar-foreground">{getPersona(persona).name}</span>
        </p>
      </div>

      {/* history */}
      <div className="ga-scroll flex-1 overflow-y-auto px-3 py-2">
        <p className="px-1 pb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Recent chats
        </p>
        <div className="flex flex-col gap-0.5">
          {conversations.length === 0 && (
            <p className="px-1 py-2 text-xs text-muted-foreground">No chats yet.</p>
          )}
          {conversations.map((c) => {
            const Icon = getPersona(c.persona).icon
            const isActive = c.id === activeId
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  selectConversation(c.id)
                  onNavigate?.()
                }}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                )}
              >
                <Icon className="size-4 shrink-0" style={{ color: 'var(--ga-accent)' }} />
                <span className="truncate">{c.title}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* usage + controls */}
      <div className="border-t border-sidebar-border p-3">
        <div className="mb-3 rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-sidebar-foreground">
              <Sparkles className="size-3.5 text-primary" />
              Chats remaining
            </span>
            <span className="font-mono text-sidebar-foreground">
              {chatsRemaining}/{chatLimit}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <ThemeSelector />
        <DarkModeToggle />
      </div>
    </div>
  )
}
