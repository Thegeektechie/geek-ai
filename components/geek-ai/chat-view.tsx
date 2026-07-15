'use client'

import { useEffect, useRef, useState } from 'react'
import { Menu as MenuIcon, X as XIcon } from 'lucide-react'
import { getPersona } from '@/lib/geek-ai'
import { useApp } from './app-provider'
import { Sidebar } from './sidebar'
import { PersonaSelector } from './persona-selector'
import { MessageBubble, ThinkingBubble } from './message-bubble'
import { ChatInput } from './chat-input'
import { GeekEmblem } from './logo'

function EmptyState() {
  const { persona, sendMessage } = useApp()
  const p = getPersona(persona)
  const Icon = p.icon

  const suggestions: Record<string, string[]> = {
    general: ['Explain quantum computing simply', 'Plan a 3-day trip to Lagos'],
    image: ['A neon circuit-board owl at night', 'Minimalist logo for a coffee brand'],
    support: ['I feel overwhelmed at work', 'Help me calm down before a talk'],
    brutal: ['Is my startup idea any good?', 'Why do I keep procrastinating?'],
    job: ['Find frontend roles for me', 'Write a cover letter for a PM role'],
    naija: ['Tell me a funny gist', 'How far, wetin dey sup?'],
    developer: ['Debug a React useEffect loop', 'Write a debounce hook in TS'],
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
      <div className="grid size-16 place-items-center rounded-2xl bg-neutral-950 text-white">
        <GeekEmblem className="size-10" />
      </div>
      <h2 className="mt-5 font-mono text-2xl font-bold tracking-tight text-foreground">
        Geek<span className="text-primary">-AI</span>
      </h2>
      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
        <Icon className="size-3.5" style={{ color: 'var(--ga-accent)' }} />
        {p.name}
      </div>
      <p className="mt-4 max-w-md text-pretty leading-relaxed text-muted-foreground">
        {p.greeting}
      </p>
      <div className="mt-6 flex w-full max-w-md flex-col gap-2">
        {(suggestions[persona] ?? []).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => sendMessage(s)}
            className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-card-foreground transition-colors hover:bg-muted"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

function ChatMain({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const { activeConversation, isThinking, persona } = useApp()
  const scrollRef = useRef<HTMLDivElement>(null)
  const messages = activeConversation?.messages ?? []

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages.length, isThinking])

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      {/* header */}
      <header className="flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="grid size-9 place-items-center rounded-xl border border-border text-foreground transition-colors hover:bg-muted lg:hidden"
          aria-label="Open menu"
        >
          <MenuIcon className="size-5" />
        </button>
        <PersonaSelector />
        <div className="ml-auto truncate text-sm text-muted-foreground">
          {activeConversation?.title ?? 'New chat'}
        </div>
      </header>

      {/* messages */}
      {messages.length === 0 && !isThinking ? (
        <EmptyState />
      ) : (
        <div ref={scrollRef} className="ga-scroll flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {isThinking && <ThinkingBubble />}
          </div>
        </div>
      )}

      <ChatInput key={persona} />
    </div>
  )
}

export function ChatView() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      {/* desktop sidebar */}
      <aside className="hidden w-72 shrink-0 border-r border-sidebar-border lg:block">
        <Sidebar />
      </aside>

      {/* mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="ga-fade-up absolute inset-y-0 left-0 w-[85%] max-w-xs border-r border-sidebar-border shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-lg text-sidebar-foreground hover:bg-sidebar-accent"
              aria-label="Close menu"
            >
              <XIcon className="size-5" />
            </button>
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <ChatMain onOpenSidebar={() => setMobileOpen(true)} />
    </div>
  )
}
