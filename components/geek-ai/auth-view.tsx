'use client'

import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useApp } from './app-provider'
import { GeekEmblem, GeekLogo } from './logo'
import { PERSONAS } from '@/lib/geek-ai'

export function AuthView() {
  const { signIn, toast } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      toast('Please enter your email and password.')
      return
    }
    setLoading(true)
    setTimeout(() => signIn(email.trim()), 700)
  }

  function handleGoogle() {
    setLoading(true)
    setTimeout(() => signIn('geek.user@gmail.com'), 700)
  }

  return (
    <div className="flex min-h-dvh w-full">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-neutral-950 p-10 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }}
          aria-hidden="true"
        />
        <div className="relative flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10">
            <GeekEmblem className="size-7" />
          </div>
          <span className="font-mono text-lg font-bold tracking-tight">
            Geek<span className="text-primary">-AI</span>
          </span>
        </div>

        <div className="relative space-y-6">
          <h1 className="text-balance font-mono text-4xl font-bold leading-tight">
            One assistant. <span className="text-primary">Seven minds.</span>
          </h1>
          <p className="max-w-md text-pretty leading-relaxed text-white/70">
            Switch personas on the fly — from brutally honest advice to Naija
            vibes, image concepts, job hunting, and full developer mode.
          </p>
          <div className="flex flex-wrap gap-2">
            {PERSONAS.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80"
              >
                <p.icon className="size-3.5 text-primary" />
                {p.short}
              </span>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/40">
          Built by Global Geek Technologies
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center bg-background px-5 py-10 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-3 text-center lg:hidden">
            <GeekLogo size="lg" />
          </div>

          <div className="mb-7 space-y-1.5">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground">
              Sign in to continue to your Geek-AI workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-11 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/40"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-xl border border-input bg-background pl-9 pr-10 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => toast('Password reset will be added soon.', 'info')}
                className="text-xs font-medium text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="h-11 w-full rounded-xl text-sm"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : 'Sign In'}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleGoogle}
            disabled={loading}
            className="h-11 w-full rounded-xl text-sm"
          >
            <GoogleIcon className="size-4" />
            Sign in with Google
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {"Don't have an account? "}
            <button
              type="button"
              onClick={() => toast('Sign-up will be added soon.', 'info')}
              className="font-medium text-primary hover:underline"
            >
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  )
}
