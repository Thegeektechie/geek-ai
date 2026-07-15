'use client'

import {
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react'
import { ArrowUp, Lock, Paperclip, X as XIcon } from 'lucide-react'
import { getPersona } from '@/lib/geek-ai'
import { useApp } from './app-provider'
import { cn } from '@/lib/utils'

interface AttachmentPayload {
  name: string
  dataUrl: string
  mimeType: string
}

export function ChatInput() {
  const { persona, sendMessage, chatsRemaining, openUpgrade } = useApp()
  const [value, setValue] = useState('')
  const [attachment, setAttachment] = useState<AttachmentPayload | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)

  const p = getPersona(persona)
  const locked = chatsRemaining <= 0

  function autoGrow() {
    const el = textRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  function submit() {
    if (locked) {
      openUpgrade()
      return
    }
    if (!value.trim() && !attachment) return
    sendMessage(value, attachment ?? undefined)
    setValue('')
    setAttachment(null)
    requestAnimationFrame(() => {
      if (textRef.current) textRef.current.style.height = 'auto'
    })
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      e.key === 'Enter' &&
      !e.shiftKey &&
      !e.nativeEvent.isComposing &&
      e.keyCode !== 229
    ) {
      e.preventDefault()
      submit()
    }
  }

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setAttachment({
        name: file.name,
        dataUrl,
        mimeType: file.type || 'application/octet-stream',
      })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  if (locked) {
    return (
      <div className="border-t border-border bg-background/80 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3">
          <div className="flex items-center gap-2.5 text-sm">
            <Lock className="size-4 text-primary" />
            <span className="text-foreground">
              You&apos;ve hit your daily free limit.
            </span>
          </div>
          <button
            type="button"
            onClick={openUpgrade}
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Upgrade
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-border bg-background/80 px-4 py-4 backdrop-blur">
      <div className="mx-auto max-w-3xl">
        {persona === 'job' && (
          <p className="mb-2 px-1 text-xs text-muted-foreground">
            Tip: attach your resume with the paperclip so I can match jobs and
            draft cover letters.
          </p>
        )}
        {attachment && (
          <div className="mb-2 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-card-foreground">
            <Paperclip className="size-3.5 text-muted-foreground" />
            <span className="max-w-[220px] truncate">{attachment.name}</span>
            <button
              type="button"
              onClick={() => setAttachment(null)}
              className="grid size-4 place-items-center rounded text-muted-foreground hover:text-foreground"
              aria-label="Remove attachment"
            >
              <XIcon className="size-3" />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={onFile}
            accept={persona === 'job' ? '.pdf,.doc,.docx' : undefined}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="grid size-9 shrink-0 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Attach file"
          >
            <Paperclip className="size-5" />
          </button>
          <textarea
            ref={textRef}
            rows={1}
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              autoGrow()
            }}
            onKeyDown={onKeyDown}
            placeholder={p.placeholder}
            className="ga-scroll max-h-40 flex-1 resize-none bg-transparent px-1 py-2 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!value.trim() && !attachment}
            className={cn(
              'grid size-9 shrink-0 place-items-center rounded-xl text-primary-foreground transition-all',
              'bg-primary hover:bg-primary/90 disabled:opacity-40',
            )}
            aria-label="Send message"
          >
            <ArrowUp className="size-5" />
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Geek-AI uses your selected persona to route requests to the most suitable model provider.
        </p>
      </div>
    </div>
  )
}
