'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { Check, Crown, Ticket, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useApp } from './app-provider'

const PLAN_PERKS = [
  'Unlimited daily chats',
  'All 7 AI personas',
  'Priority image generation',
  'Faster response speed',
]

export function UpgradeModal() {
  const { upgradeOpen, closeUpgrade, applyCoupon, toast } = useApp()
  const [coupon, setCoupon] = useState('')

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeUpgrade()
    }
    if (upgradeOpen) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [upgradeOpen, closeUpgrade])

  if (!upgradeOpen) return null

  function handleUpgrade() {
    toast('Feature will be added soon.', 'info')
  }

  function handleCoupon(e: FormEvent) {
    e.preventDefault()
    const ok = applyCoupon(coupon)
    if (ok) setCoupon('')
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeUpgrade}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-title"
        className="ga-fade-up relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl"
      >
        <button
          type="button"
          onClick={closeUpgrade}
          className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>

        {/* header */}
        <div className="bg-neutral-950 px-6 py-6 text-white">
          <div className="flex items-center gap-2 text-primary">
            <Crown className="size-5" />
            <span className="text-sm font-medium uppercase tracking-wide">Geek-AI Pro</span>
          </div>
          <h3 id="upgrade-title" className="mt-2 text-2xl font-bold">
            You&apos;ve reached your daily limit
          </h3>
          <p className="mt-1 text-sm text-white/70">
            Upgrade to keep chatting without limits.
          </p>
        </div>

        <div className="space-y-5 px-6 py-5">
          {/* Payment section */}
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-foreground">Pro plan</span>
              <span className="text-sm text-muted-foreground">
                <span className="text-lg font-bold text-foreground">$9</span>/mo
              </span>
            </div>
            <ul className="mt-3 grid grid-cols-2 gap-2">
              {PLAN_PERKS.map((perk) => (
                <li key={perk} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Check className="size-3.5 shrink-0 text-primary" />
                  {perk}
                </li>
              ))}
            </ul>
            <Button
              type="button"
              size="lg"
              onClick={handleUpgrade}
              className="mt-4 h-11 w-full rounded-xl"
            >
              <Crown className="size-4" />
              Upgrade to Pro
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">have a coupon?</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          {/* Coupon section */}
          <form onSubmit={handleCoupon} className="space-y-2">
            <label htmlFor="coupon" className="text-sm font-medium text-foreground">
              Enter coupon code
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Ticket className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="coupon"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="e.g. GEEKAI-XXXX"
                  className="h-11 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm uppercase outline-none transition-colors placeholder:text-muted-foreground placeholder:normal-case focus:border-ring focus:ring-2 focus:ring-ring/40"
                />
              </div>
              <Button type="submit" variant="outline" size="lg" className="h-11 rounded-xl px-5">
                Apply
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
