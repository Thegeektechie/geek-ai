'use client'

import { Check, ChevronDown } from 'lucide-react'
import { PERSONAS, getPersona } from '@/lib/geek-ai'
import { useApp } from './app-provider'
import { Menu, MenuItem } from './menu'

export function PersonaSelector() {
  const { persona, setPersona } = useApp()
  const active = getPersona(persona)
  const Icon = active.icon

  return (
    <Menu
      align="start"
      panelClassName="w-72"
      trigger={(open) => (
        <span className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
          <span
            className="grid size-6 place-items-center rounded-lg text-[var(--ga-accent-fg)]"
            style={{ backgroundColor: 'var(--ga-accent)' }}
          >
            <Icon className="size-3.5" />
          </span>
          <span className="hidden sm:inline">{active.name}</span>
          <span className="sm:hidden">{active.short}</span>
          <ChevronDown
            className={`size-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </span>
      )}
    >
      {(close) => (
        <div className="max-h-[70vh] overflow-y-auto">
          <p className="px-2.5 pb-1.5 pt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            AI Personas
          </p>
          {PERSONAS.map((p) => {
            const PIcon = p.icon
            const isActive = p.id === persona
            return (
              <MenuItem
                key={p.id}
                active={isActive}
                onClick={() => {
                  setPersona(p.id)
                  close()
                }}
                className="items-start"
              >
                <span
                  className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg"
                  style={{
                    backgroundColor: isActive ? 'var(--ga-accent)' : 'var(--ga-accent-soft)',
                    color: isActive ? 'var(--ga-accent-fg)' : 'var(--ga-accent)',
                  }}
                >
                  <PIcon className="size-4" />
                </span>
                <span className="flex-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    {p.name}
                    {isActive && <Check className="size-3.5 text-primary" />}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                    {p.description}
                  </span>
                </span>
              </MenuItem>
            )
          })}
        </div>
      )}
    </Menu>
  )
}
