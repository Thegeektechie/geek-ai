import { NextResponse } from 'next/server'
import {
  DEVELOPER_BIO,
  isMakerQuestion,
  PERSONA_PROVIDER,
  PERSONA_SYSTEM_PROMPTS,
  type PersonaId,
} from '@/lib/geek-ai'

export const runtime = 'nodejs'
export const maxDuration = 60

interface IncomingMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  persona: PersonaId
  messages: IncomingMessage[]
  attachment?: { name: string; dataUrl: string; mimeType: string } | null
}

/* ------------------------------- OpenRouter ------------------------------- */

async function callOpenRouter(
  system: string,
  messages: IncomingMessage[],
): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY_2
  const groqKey = process.env.GROQ_API_KEY || process.env.GROQ_API_KEY_2

  console.log('[v0] OpenRouter check - has key:', !!key, 'has groqKey:', !!groqKey)

  // Prefer OpenRouter free Llama 3; fall back to Groq if only that is set.
  if (key) {
    console.log('[v0] Using OpenRouter with Llama 3.3-70b')
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://geek-ai.vercel.app',
        'X-Title': 'Geek-AI',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: [{ role: 'system', content: system }, ...messages],
      }),
    })
    if (!res.ok) {
      const detail = await res.text()
      console.log('[v0] OpenRouter error response:', res.status, detail.slice(0, 200))
      throw new Error(`OpenRouter ${res.status}: ${detail.slice(0, 200)}`)
    }
    const data = await res.json()
    const content = data.choices?.[0]?.message?.content ?? 'No response generated.'
    console.log('[v0] OpenRouter success - response length:', content.length)
    return content
  }

  if (groqKey) {
    console.log('[v0] Using Groq with Llama 3.3-70b')
    const res = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'system', content: system }, ...messages],
        }),
      },
    )
    if (!res.ok) {
      const detail = await res.text()
      console.log('[v0] Groq error response:', res.status, detail.slice(0, 200))
      throw new Error(`Groq ${res.status}: ${detail.slice(0, 200)}`)
    }
    const data = await res.json()
    const content = data.choices?.[0]?.message?.content ?? 'No response generated.'
    console.log('[v0] Groq success - response length:', content.length)
    return content
  }

  throw new Error('missing-key:OpenRouter or Groq')
}

/* --------------------------------- Gemini --------------------------------- */

async function callGemini(
  system: string,
  messages: IncomingMessage[],
  attachment?: ChatRequest['attachment'],
): Promise<string> {
  const key = process.env.Google_Gemini_API_KEY
  if (!key) throw new Error('missing-key:Gemini API key is not configured yet. Add it in Project Settings to enable live responses.')

  console.log('[v0] Using Gemini 1.5 Flash - has attachment:', !!attachment)

  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }] as Array<
      { text: string } | { inlineData: { mimeType: string; data: string } }
    >,
  }))

  // Attach the resume/file to the latest user turn for Gemini to read.
  if (attachment?.dataUrl) {
    const base64 = attachment.dataUrl.split(',')[1] ?? ''
    const last = contents[contents.length - 1]
    if (last && base64) {
      last.parts.push({
        inlineData: { mimeType: attachment.mimeType, data: base64 },
      })
      console.log('[v0] Attachment added to Gemini request - mimeType:', attachment.mimeType, 'size:', base64.length)
    }
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
      }),
    },
  )
  if (!res.ok) {
    const detail = await res.text()
    console.log('[v0] Gemini error response:', res.status, detail.slice(0, 200))
    throw new Error(`Gemini ${res.status}: ${detail.slice(0, 200)}`)
  }
  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? '')
    .join('')
  console.log('[v0] Gemini success - response length:', text?.length)
  return text || 'No response generated.'
}

/* --------------------------------- Handler -------------------------------- */

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatRequest
    const { persona, messages, attachment } = body

    if (!messages?.length) {
      return NextResponse.json({ error: 'No messages provided.' }, { status: 400 })
    }

    // Always answer the "who made you" question with the official bio.
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    if (lastUser && isMakerQuestion(lastUser.content)) {
      return NextResponse.json({ content: DEVELOPER_BIO })
    }

    const system = PERSONA_SYSTEM_PROMPTS[persona] ?? PERSONA_SYSTEM_PROMPTS.general
    const provider = PERSONA_PROVIDER[persona] ?? 'openrouter'

    console.log('[v0] Chat request:', { persona, provider, hasAttachment: !!attachment })

    let content: string
    if (provider === 'gemini') {
      console.log('[v0] Routing to Gemini (Job Hunter / Developer Mode)')
      content = await callGemini(system, messages, attachment)
    } else {
      console.log('[v0] Routing to OpenRouter/Groq (Emotional Support, Naija Vibes, Brutal Honesty, General)')
      content = await callOpenRouter(system, messages)
    }

    console.log('[v0] Response generated successfully, length:', content?.length)
    return NextResponse.json({ content })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.log('[v0] Chat route error:', message)
    if (message.startsWith('missing-key:')) {
      const which = message.split(':')[1]
      return NextResponse.json(
        {
          error: `The ${which} API key is not configured yet. Add it in Project Settings to enable live responses.`,
          missingKey: true,
        },
        { status: 503 },
      )
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
