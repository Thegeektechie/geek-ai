import { cn } from '@/lib/utils'

/**
 * Global Geek "circuit geek" emblem — simplified brand mark.
 * Head + circuit traces use currentColor; the glasses use the brand orange.
 */
export function GeekEmblem({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
      role="img"
    >
      {/* circuit traces */}
      <g
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M24 33 V22 L20 18" />
        <path d="M29 33 V15" />
        <path d="M34 33 V12 L38 8" />
        <path d="M39 33 V20 L44 15" />
        <path d="M27 33 V26 L23 22" />
        <path d="M42 33 V24" />
      </g>
      <g fill="currentColor">
        <circle cx="20" cy="17" r="2" />
        <circle cx="29" cy="14" r="2" />
        <circle cx="38" cy="8" r="2" />
        <circle cx="44" cy="14" r="2" />
        <circle cx="23" cy="21" r="2" />
        <circle cx="42" cy="23" r="2" />
      </g>
      {/* head / face outline */}
      <path
        d="M20 33 h24 v6 h4 v6 h-4 v3 h-24 v-3 h-4 v-6 h4 z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* glasses (brand orange) */}
      <g stroke="#ea580c" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="23" y="44" width="8" height="7" rx="1" />
        <rect x="33" y="44" width="8" height="7" rx="1" />
        <path d="M23 46 L14 42 L12 45" />
        <path d="M41 46 L50 42 L52 45" />
      </g>
    </svg>
  )
}

export function GeekLogo({
  className,
  showWord = true,
  size = 'md',
}: {
  className?: string
  showWord?: boolean
  size?: 'sm' | 'md' | 'lg'
}) {
  const tile =
    size === 'lg' ? 'size-12 rounded-2xl' : size === 'sm' ? 'size-8 rounded-lg' : 'size-10 rounded-xl'
  const emblem = size === 'lg' ? 'size-8' : size === 'sm' ? 'size-5' : 'size-6'
  const word = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-lg'

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className={cn('grid place-items-center bg-neutral-950 text-white shadow-sm', tile)}>
        <GeekEmblem className={emblem} />
      </div>
      {showWord && (
        <div className="leading-none">
          <span className={cn('font-mono font-bold tracking-tight text-foreground', word)}>
            Geek<span className="text-primary">-AI</span>
          </span>
        </div>
      )}
    </div>
  )
}
