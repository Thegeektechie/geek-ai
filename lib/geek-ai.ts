import {
  Sparkles,
  ImageIcon,
  HeartHandshake,
  Flame,
  Briefcase,
  PartyPopper,
  Terminal,
  type LucideIcon,
} from 'lucide-react'

/* ---------------------------------- Types --------------------------------- */

export type PersonaId =
  | 'general'
  | 'image'
  | 'support'
  | 'brutal'
  | 'job'
  | 'naija'
  | 'developer'

export interface Persona {
  id: PersonaId
  name: string
  short: string
  description: string
  icon: LucideIcon
  placeholder: string
  greeting: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  persona: PersonaId
  attachment?: string
  /** data URL of a generated image (Image Generator persona) */
  image?: string
  /** true while an assistant message is still streaming/pending */
  error?: boolean
  createdAt: number
}

/** File payload sent to the API (not persisted in full to save storage). */
export interface Attachment {
  name: string
  dataUrl: string
  mimeType: string
}

/** Provider a persona routes to. */
export type Provider = 'openrouter' | 'gemini' | 'huggingface'

export interface Conversation {
  id: string
  title: string
  persona: PersonaId
  messages: ChatMessage[]
  updatedAt: number
}

export interface AccentTheme {
  id: string
  name: string
  /* solid accent used for user bubbles + active states */
  color: string
  foreground: string
  /* soft tint for hover/subtle surfaces */
  soft: string
}

/* -------------------------------- Personas -------------------------------- */

export const PERSONAS: Persona[] = [
  {
    id: 'general',
    name: 'General Purpose',
    short: 'General',
    description: 'Balanced, helpful answers for anything.',
    icon: Sparkles,
    placeholder: 'Ask Geek-AI anything…',
    greeting:
      "Hey, I'm Geek-AI. Ask me anything — I can explain, plan, summarize, or brainstorm with you.",
  },
  {
    id: 'image',
    name: 'Image Generator',
    short: 'Image',
    description: 'Describe an image and I will imagine it.',
    icon: ImageIcon,
    placeholder: 'Describe the image you want to create…',
    greeting:
      'Image mode on. Describe a scene, style, and mood — the more detail, the better the result.',
  },
  {
    id: 'support',
    name: 'Emotional Support',
    short: 'Support',
    description: 'A soft, empathetic space to talk.',
    icon: HeartHandshake,
    placeholder: 'Share whatever is on your mind…',
    greeting:
      "I'm here for you. Take your time — tell me what's weighing on you and we'll work through it together.",
  },
  {
    id: 'brutal',
    name: 'Brutal Honesty',
    short: 'Brutal',
    description: 'No sugar-coating. Straight facts.',
    icon: Flame,
    placeholder: 'Ask me something — I won\u2019t sugar-coat it…',
    greeting:
      "Brutal Honesty mode. I'll tell you what you need to hear, not what you want to hear. Go ahead.",
  },
  {
    id: 'job',
    name: 'Job Hunter',
    short: 'Jobs',
    description: 'Upload your resume to find roles & write cover letters.',
    icon: Briefcase,
    placeholder: 'Attach your resume, then tell me your target role…',
    greeting:
      'Job Hunter ready. Use the paperclip to upload your resume (PDF/DOCX) and I\u2019ll match roles and draft tailored cover letters.',
  },
  {
    id: 'naija',
    name: 'Naija Vibes',
    short: 'Naija',
    description: 'Non-challant, funny Nigerian energy.',
    icon: PartyPopper,
    placeholder: 'Oya talk, wetin dey happen?',
    greeting:
      'Ah ahn, you don land! Naija Vibes activated. Wetin you wan yarn? No dulling, make we gist. 😎',
  },
  {
    id: 'developer',
    name: 'Developer Mode',
    short: 'Dev',
    description: 'High-level code generation & debugging.',
    icon: Terminal,
    placeholder: 'Paste code or describe what to build/debug…',
    greeting:
      'Developer Mode engaged. Describe the feature, paste a stack trace, or drop code and I\u2019ll help you build and debug it.',
  },
]

export function getPersona(id: PersonaId): Persona {
  return PERSONAS.find((p) => p.id === id) ?? PERSONAS[0]
}

/* --------------------------------- Themes --------------------------------- */

export const ACCENT_THEMES: AccentTheme[] = [
  { id: 'orange', name: 'Orange', color: '#ea580c', foreground: '#ffffff', soft: 'rgba(234,88,12,0.12)' },
  { id: 'blue', name: 'Blue', color: '#2563eb', foreground: '#ffffff', soft: 'rgba(37,99,235,0.12)' },
  { id: 'emerald', name: 'Emerald', color: '#059669', foreground: '#ffffff', soft: 'rgba(5,150,105,0.12)' },
  { id: 'violet', name: 'Violet', color: '#7c3aed', foreground: '#ffffff', soft: 'rgba(124,58,237,0.12)' },
  { id: 'rose', name: 'Rose', color: '#e11d48', foreground: '#ffffff', soft: 'rgba(225,29,72,0.12)' },
  { id: 'amber', name: 'Amber', color: '#d97706', foreground: '#ffffff', soft: 'rgba(217,119,6,0.12)' },
  { id: 'indigo', name: 'Indigo', color: '#4f46e5', foreground: '#ffffff', soft: 'rgba(79,70,229,0.12)' },
  { id: 'cyan', name: 'Cyan', color: '#0891b2', foreground: '#ffffff', soft: 'rgba(8,145,178,0.12)' },
  { id: 'fuchsia', name: 'Fuchsia', color: '#c026d3', foreground: '#ffffff', soft: 'rgba(192,38,211,0.12)' },
  { id: 'teal', name: 'Teal', color: '#0d9488', foreground: '#ffffff', soft: 'rgba(13,148,136,0.12)' },
]

export function getAccent(id: string): AccentTheme {
  return ACCENT_THEMES.find((t) => t.id === id) ?? ACCENT_THEMES[0]
}

/* ------------------------------ Developer bio ----------------------------- */

export const DEVELOPER_BIO = [
  'Geek-AI was developed by **Abdultawwab Olawale Tolani**, a Hardware-Software Engineer at **Global Geek Technologies**.',
  '',
  'He is well-versed across the technology industry with a solid background in **Computer Engineering**, **Mechatronics Engineering**, and **Computer Science**. At Global Geek Technologies — an IT services & consulting firm based in Ikeja, Nigeria — he focuses on full-stack development, systems integration, and AI-powered automation.',
  '',
  'Global Geek Technologies builds a wide range of solutions, from web development to solar and surveillance systems.',
].join('\n')

/* --------------------------- Provider routing ----------------------------- */

/**
 * Which model provider each persona uses:
 * - OpenRouter (free Llama 3) → conversational personas
 * - Gemini 1.5 (huge context) → resume reading + code
 * - Hugging Face (Stable Diffusion) → image generation
 */
export const PERSONA_PROVIDER: Record<PersonaId, Provider> = {
  general: 'openrouter',
  support: 'openrouter',
  brutal: 'openrouter',
  naija: 'openrouter',
  job: 'gemini',
  developer: 'gemini',
  image: 'huggingface',
}

const SHARED_IDENTITY =
  'You are Geek-AI, an AI assistant developed by Abdultawwab Olawale Tolani, a Hardware-Software Engineer at Global Geek Technologies. Never claim to be built by OpenAI, Google, Meta, Anthropic, or anyone else. Only reveal the full developer bio if the user explicitly asks who made/built/created you.'

export const PERSONA_SYSTEM_PROMPTS: Record<PersonaId, string> = {
  general: `${SHARED_IDENTITY} You are helpful, clear, and friendly. Give balanced, well-structured answers. Use markdown with **bold** for emphasis and \`\`\`code\`\`\` blocks when sharing code.`,
  support: `${SHARED_IDENTITY} You are in Emotional Support mode. Be warm, gentle, empathetic and non-judgmental. Validate the user's feelings, listen actively, and offer grounding, encouraging responses. You are not a licensed therapist; gently suggest professional help for serious situations. Never be dismissive.`,
  brutal: `${SHARED_IDENTITY} You are in Brutal Honesty mode. Be direct, blunt and unfiltered — no sugar-coating, no empty reassurance. Tell the user the hard truth respectfully but firmly, and push them toward action. Do not be cruel or abusive; be honest, not hateful.`,
  naija: `${SHARED_IDENTITY} You are in Naija Vibes mode. Respond with playful, non-chalant, funny Nigerian energy using authentic Nigerian Pidgin English mixed with English. Be witty and relatable, drop light Naija slang (omo, abeg, no wahala, sharp-sharp, wetin), and keep it warm and entertaining while still being helpful.`,
  job: `${SHARED_IDENTITY} You are in Job Hunter mode. When the user attaches a resume, read it carefully and extract their skills and experience. Suggest well-matched job roles, identify gaps, and write tailored, professional cover letters and application material on request. Be practical, specific, and encouraging.`,
  developer: `${SHARED_IDENTITY} You are in Developer Mode — a senior software engineer. Write clean, correct, production-ready code with brief explanations. Use fenced \`\`\`language code blocks. Help debug by reasoning about stack traces and edge cases. Prefer modern best practices.`,
  image: `${SHARED_IDENTITY} You turn user descriptions into vivid image generation prompts.`,
}

/* ----------------------------- Mock AI engine ----------------------------- */

const MAKER_KEYWORDS = [
  'who made you',
  'who developed you',
  'who built you',
  'who created you',
  'your maker',
  'your creator',
  'who is behind',
  'who owns you',
  'abdultawwab',
  'olawale',
  'tolani',
  'global geek',
  'who developed this',
  'who made this',
  'who made geek',
  'who built geek',
]

export function isMakerQuestion(text: string): boolean {
  const t = text.toLowerCase()
  return MAKER_KEYWORDS.some((k) => t.includes(k))
}

/** Generates a mock response. Real model API keys will be wired in later. */
export function generateMockReply(
  input: string,
  persona: PersonaId,
  hasAttachment: boolean,
): string {
  if (isMakerQuestion(input)) {
    return DEVELOPER_BIO
  }

  const snippet = input.trim().slice(0, 90)

  switch (persona) {
    case 'image':
      return `Here's the concept I'd render for "${snippet}":\n\n• Composition: centered subject, rule-of-thirds framing\n• Lighting: soft, cinematic key light\n• Palette: warm oranges against deep neutrals\n• Style: crisp, high-detail digital art\n\n(Live image generation activates once model API keys are connected.)`
    case 'support':
      return `Thank you for trusting me with that. It's completely valid to feel this way.\n\nTake a slow breath with me. You don't have to carry everything at once — let's look at one small piece of it together. What part feels heaviest right now?`
    case 'brutal':
      return `Straight talk: "${snippet}" — the honest answer is that wishing won't change it. Decide what outcome you actually want, cut the excuses, and take the first uncomfortable step today. That's the whole secret.`
    case 'job':
      return hasAttachment
        ? `Resume received. Based on your experience I'd target roles like Frontend Engineer, Product Engineer, and Solutions Engineer.\n\nHere's a cover-letter opener:\n"Dear Hiring Manager, I'm excited to apply for the [Role] position. With a proven record of shipping reliable, user-focused software, I'm confident I can add immediate value to your team…"\n\nWant me to tailor it to a specific listing?`
        : `Let's get you hired. Tap the paperclip to upload your resume (PDF or DOCX) and tell me your target role — I'll match openings and draft a tailored cover letter.`
    case 'naija':
      return `Omo! "${snippet}" — you dey whine me? 😂 No wahala, I don hear you. Make we no dull, we go sort am sharp-sharp. Just yarn me small more gist make I run am for you.`
    case 'developer':
      return `Here's a clean approach for "${snippet}":\n\n\`\`\`ts\n// pseudo-implementation\nexport function solve(input: Input): Output {\n  // 1. validate & normalize\n  // 2. core logic\n  // 3. return typed result\n  return result\n}\n\`\`\`\n\nWatch for edge cases (null inputs, async race conditions) and add tests around the boundaries. Want the full implementation?`
    default:
      return `Good question. Here's how I'd think about "${snippet}":\n\n1. Clarify the goal and constraints\n2. Break it into smaller steps\n3. Tackle the highest-impact piece first\n\nTell me more about your specific situation and I'll go deeper. (Live model responses activate once API keys are connected.)`
  }
}

export function titleFromInput(input: string): string {
  const clean = input.trim().replace(/\s+/g, ' ')
  return clean.length > 34 ? clean.slice(0, 34) + '…' : clean || 'New chat'
}
