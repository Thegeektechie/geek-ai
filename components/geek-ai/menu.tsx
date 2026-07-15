'use client'

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'

interface MenuProps {
  trigger: (open: boolean) => ReactNode
  children: (close: () => void) => ReactNode
  align?: 'start' | 'end'
  side?: 'top' | 'bottom'
  className?: string
  panelClassName?: string
}

/** Lightweight click-outside dropdown used across Geek-AI. */
export function Menu({
  trigger,
  children,
  align = 'start',
  side = 'bottom',
  className,
  panelClassName,
}: MenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="block w-full text-left"
      >
        {trigger(open)}
      </button>
      {open && (
        <div
          role="menu"
          className={cn(
            'ga-fade-up absolute z-50 min-w-[12rem] overflow-hidden rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl',
            side === 'bottom' ? 'top-[calc(100%+6px)]' : 'bottom-[calc(100%+6px)]',
            align === 'end' ? 'right-0' : 'left-0',
            panelClassName,
          )}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  )
}

export function MenuItem({
  children,
  onClick,
  active,
  className,
}: {
  children: ReactNode
  onClick?: () => void
  active?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted',
        active && 'bg-muted',
        className,
      )}
    >
      {children}
    </button>
  )
}
