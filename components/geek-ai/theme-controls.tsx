'use client'

import { Check, Moon, Palette, Sun } from 'lucide-react'
import { ACCENT_THEMES } from '@/lib/geek-ai'
import { useApp } from './app-provider'
import { Menu } from './menu'

export function DarkModeToggle() {
  const { dark, toggleDark } = useApp()
  return (
    <button
      type="button"
      onClick={toggleDark}
      className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
      aria-label="Toggle dark mode"
    >
      {dark ? <Moon className="size-4" /> : <Sun className="size-4" />}
      <span className="flex-1 text-left">{dark ? 'Dark' : 'Light'} mode</span>
      <span className="relative inline-flex h-5 w-9 items-center rounded-full bg-muted transition-colors data-[on=true]:bg-primary" data-on={dark}>
        <span className="absolute left-0.5 size-4 rounded-full bg-background shadow transition-transform data-[on=true]:translate-x-4" data-on={dark} />
      </span>
    </button>
  )
}

export function ThemeSelector() {
  const { accentId, setAccent } = useApp()

  return (
    <Menu
      side="top"
      align="start"
      panelClassName="w-64"
      trigger={() => (
        <span className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent">
          <Palette className="size-4" />
          <span className="flex-1 text-left">Chat theme</span>
          <span
            className="size-4 rounded-full ring-2 ring-background"
            style={{ backgroundColor: 'var(--ga-accent)' }}
          />
        </span>
      )}
    >
      {() => (
        <div>
          <p className="px-2.5 pb-1.5 pt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Accent color
          </p>
          <div className="grid grid-cols-5 gap-1.5 p-1.5">
            {ACCENT_THEMES.map((t) => {
              const isActive = t.id === accentId
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setAccent(t.id)}
                  title={t.name}
                  aria-label={t.name}
                  className="grid aspect-square place-items-center rounded-lg transition-transform hover:scale-105"
                  style={{ backgroundColor: t.color }}
                >
                  {isActive && <Check className="size-4 text-white" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </Menu>
  )
}
