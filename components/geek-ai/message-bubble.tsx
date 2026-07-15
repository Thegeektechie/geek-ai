'use client'

import { Fragment } from 'react'
import { Paperclip } from 'lucide-react'
import { getPersona, type ChatMessage } from '@/lib/geek-ai'
import { GeekEmblem } from './logo'
import { cn } from '@/lib/utils'

/** Renders **bold**, ```code``` blocks and line breaks from mock replies. */
function RichText({ text }: { text: string }) {
  const blocks = text.split(/```/)
  return (
    <>
      {blocks.map((block, i) => {
        if (i % 2 === 1) {
          const cleaned = block.replace(/^[a-zA-Z]+\n/, '')
          return (
            <pre
              key={i}
              className="ga-scroll my-2 overflow-x-auto rounded-lg bg-neutral-950 p-3 font-mono text-xs leading-relaxed text-neutral-100"
            >
              <code>{cleaned}</code>
            </pre>
          )
        }
        return (
          <span key={i}>
            {block.split('\n').map((line, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                <InlineBold text={line} />
              </Fragment>
            ))}
          </span>
        )
      })}
    </>
  )
}

function InlineBold({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') ? (
          <strong key={i} className="font-semibold">
            {p.slice(2, -2)}
          </strong>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  )
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  const persona = getPersona(message.persona)

  if (isUser) {
    return (
      <div className="ga-fade-up flex justify-end gap-3">
        <div className="flex max-w-[85%] flex-col items-end gap-1.5 sm:max-w-[75%]">
          {message.attachment && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-card-foreground">
              <Paperclip className="size-3.5 text-muted-foreground" />
              {message.attachment}
            </span>
          )}
          {message.content && (
            <div
              className="rounded-2xl rounded-br-md px-4 py-2.5 text-sm leading-relaxed shadow-sm"
              style={{
                backgroundColor: 'var(--ga-accent)',
                color: 'var(--ga-accent-fg)',
              }}
            >
              <RichText text={message.content} />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="ga-fade-up flex gap-3">
      <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-neutral-950 text-white">
        <GeekEmblem className="size-5" />
      </div>
      <div className="flex max-w-[85%] flex-col gap-1 sm:max-w-[78%]">
        <span className="text-xs font-medium text-muted-foreground">
          Geek-AI · {persona.short}
        </span>
        <div
          className={cn(
            'rounded-2xl rounded-tl-md border border-border bg-card px-4 py-3 text-sm leading-relaxed text-card-foreground shadow-sm',
          )}
        >
          <RichText text={message.content} />
        </div>
      </div>
    </div>
  )
}

export function ThinkingBubble() {
  return (
    <div className="ga-fade-up flex gap-3">
      <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-neutral-950 text-white">
        <GeekEmblem className="size-5" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-border bg-card px-4 py-4 shadow-sm">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="ga-typing-dot size-2 rounded-full bg-muted-foreground"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </div>
    </div>
  )
}
