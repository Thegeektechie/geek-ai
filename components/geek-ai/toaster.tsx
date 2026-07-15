'use client'

import { CheckCircle2, Info, X as XIcon } from 'lucide-react'
import { useApp } from './app-provider'
import { cn } from '@/lib/utils'

export function Toaster() {
  const { toasts, dismissToast } = useApp()

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="ga-fade-up pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm text-card-foreground shadow-lg"
          role="status"
        >
          {t.variant === 'success' ? (
            <CheckCircle2 className="size-4 shrink-0 text-primary" />
          ) : (
            <Info className="size-4 shrink-0 text-muted-foreground" />
          )}
          <span className="flex-1 leading-snug">{t.message}</span>
          <button
            type="button"
            onClick={() => dismissToast(t.id)}
            className={cn(
              'grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground',
              'hover:bg-muted hover:text-foreground',
            )}
            aria-label="Dismiss notification"
          >
            <XIcon className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
