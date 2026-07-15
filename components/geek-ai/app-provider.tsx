'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  getAccent,
  getPersona,
  titleFromInput,
  type ChatMessage,
  type Conversation,
  type PersonaId,
} from '@/lib/geek-ai'

type View = 'auth' | 'chat' | 'admin'

interface User {
  id: string
  name: string
  email: string
  password?: string
  createdAt: number
  lastSeen: number
}

interface Toast {
  id: string
  message: string
  variant: 'default' | 'success' | 'info'
}

interface AttachmentPayload {
  name: string
  dataUrl: string
  mimeType: string
}

interface AppState {
  view: View
  user: User | null
  dark: boolean
  accentId: string
  persona: PersonaId
  conversations: Conversation[]
  activeId: string | null
  activeConversation: Conversation | null
  isThinking: boolean
  chatLimit: number
  chatsRemaining: number
  upgradeOpen: boolean
  toasts: Toast[]
  // actions
  signIn: (email: string, password?: string) => void
  signUp: (email: string, password?: string) => void
  signOut: () => void
  toggleDark: () => void
  setAccent: (id: string) => void
  setPersona: (id: PersonaId) => void
  newChat: () => void
  selectConversation: (id: string) => void
  sendMessage: (text: string, attachment?: AttachmentPayload) => void
  setView: (v: View) => void
  openUpgrade: () => void
  closeUpgrade: () => void
  applyCoupon: (code: string) => boolean
  toast: (message: string, variant?: Toast['variant']) => void
  dismissToast: (id: string) => void
}

const Ctx = createContext<AppState | null>(null)

const uid = () => Math.random().toString(36).slice(2, 10)
const STORAGE_KEY = 'geek-ai-state-v1'
const ACCOUNTS_KEY = 'geek-ai-accounts-v1'

// Persist chat history per user so multiple accounts on the same device don't share logs.
const HISTORY_PREFIX = 'geek-ai-history-v1:'

function getHistoryKey(userId: string) {
  return `${HISTORY_PREFIX}${userId}`
}


const seedConversations = (): Conversation[] => [
  {
    id: 'seed-1',
    title: 'Ideas for a weekend project',
    persona: 'general',
    updatedAt: Date.now() - 1000 * 60 * 60 * 3,
    messages: [],
  },
  {
    id: 'seed-2',
    title: 'Debug my React state bug',
    persona: 'developer',
    updatedAt: Date.now() - 1000 * 60 * 60 * 26,
    messages: [],
  },
  {
    id: 'seed-3',
    title: 'Cover letter for frontend role',
    persona: 'job',
    updatedAt: Date.now() - 1000 * 60 * 60 * 50,
    messages: [],
  },
]

function readPersistedState() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw
      ? (JSON.parse(raw) as Partial<{
          user: User | null
          view: View
          dark: boolean
          accentId: string
          persona: PersonaId
          // conversations are now loaded per-user from HISTORY_PREFIX
          activeId: string | null
          chatLimit: number
          chatsRemaining: number
        }>)
      : null
  } catch {
    return null
  }
}


function writePersistedState(state: Partial<{
  user: User | null
  view: View
  dark: boolean
  accentId: string
  persona: PersonaId
  // conversations are now saved per-user
  activeId: string | null
  chatLimit: number
  chatsRemaining: number
}>) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore persistence errors in browser-only mode.
  }
}

function readPersistedHistory(userId: string): Conversation[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(getHistoryKey(userId))
    if (!raw) return null
    return JSON.parse(raw) as Conversation[]
  } catch {
    return null
  }
}

function writePersistedHistory(userId: string, convos: Conversation[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(getHistoryKey(userId), JSON.stringify(convos))
  } catch {
    // Ignore persistence errors in browser-only mode.
  }
}


function readStoredAccounts() {
  if (typeof window === 'undefined') return [] as User[]
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY)
    return raw ? (JSON.parse(raw) as User[]) : []
  } catch {
    return [] as User[]
  }
}

function writeStoredAccounts(accounts: User[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  } catch {
    // Ignore persistence errors in browser-only mode.
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>('auth')
  const [user, setUser] = useState<User | null>(null)
  const [dark, setDark] = useState(false)
  const [accentId, setAccentId] = useState('orange')
  const [persona, setPersonaState] = useState<PersonaId>('general')
  const [conversations, setConversations] = useState<Conversation[]>(seedConversations)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isThinking, setIsThinking] = useState(false)
  const [chatLimit, setChatLimit] = useState(10)
  const [chatsRemaining, setChatsRemaining] = useState(10)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = readPersistedState()
    if (stored) {
      const nextUser = stored.user ?? null
      if (nextUser) {
        setUser(nextUser)
        // Load this user's conversation history
        const history = readPersistedHistory(nextUser.id)
        if (history && history.length) {
          setConversations(history)
        }
      }

      if (typeof stored.dark === 'boolean') setDark(stored.dark)
      if (stored.accentId) setAccentId(stored.accentId)
      if (stored.persona) setPersonaState(stored.persona)
      if (stored.activeId !== undefined) setActiveId(stored.activeId)
      if (stored.chatLimit) setChatLimit(stored.chatLimit)
      if (stored.chatsRemaining) setChatsRemaining(stored.chatsRemaining)
      if (stored.view) setView(stored.view)
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
      // Top-level persisted UI settings only; conversation history is persisted per user.
      writePersistedState({
        user,
        view,
        dark,
        accentId,
        persona,
        activeId,
        chatLimit,
        chatsRemaining,
      })

      if (user) {
        writePersistedHistory(user.id, conversations)
      }
  }, [hydrated, user, view, dark, accentId, persona, conversations, activeId, chatLimit, chatsRemaining])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', dark)
    root.classList.toggle('light', !dark)
  }, [dark])

  useEffect(() => {
    const a = getAccent(accentId)
    const root = document.documentElement
    root.style.setProperty('--ga-accent', a.color)
    root.style.setProperty('--ga-accent-fg', a.foreground)
    root.style.setProperty('--ga-accent-soft', a.soft)
  }, [accentId])

  const dismissToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const toast = useCallback(
    (message: string, variant: Toast['variant'] = 'default') => {
      const id = uid()
      setToasts((t) => [...t, { id, message, variant }])
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
    },
    [],
  )

  const signIn = useCallback(
    (email: string, password?: string) => {
      const normalized = email.trim().toLowerCase()
      if (!normalized) {
        toast('Please enter an email address.', 'default')
        return
      }

      const accounts = readStoredAccounts()
      const existing = accounts.find((account) => account.email.toLowerCase() === normalized)
      if (!existing) {
        toast('No account found yet. Use Create account first.', 'info')
        return
      }

      if (existing.password && password && existing.password !== password) {
        toast('The password does not match this account.', 'default')
        return
      }

      const nextUser = { ...existing, lastSeen: Date.now() }
      writeStoredAccounts(accounts.map((account) => (account.email.toLowerCase() === normalized ? nextUser : account)))
      setUser(nextUser)
      setView('chat')
      toast(`Welcome back, ${nextUser.name}.`, 'success')
    },
    [toast],
  )

  const signUp = useCallback(
    (email: string, password?: string) => {
      const normalized = email.trim().toLowerCase()
      if (!normalized) {
        toast('Please enter an email address.', 'default')
        return
      }

      const accounts = readStoredAccounts()
      const existing = accounts.find((account) => account.email.toLowerCase() === normalized)
      if (existing) {
        toast('That account already exists. Please sign in.', 'info')
        return
      }

      const name = normalized.split('@')[0] || 'Geek'
      const nextUser: User = {
        id: uid(),
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email: normalized,
        password: password || 'local-password',
        createdAt: Date.now(),
        lastSeen: Date.now(),
      }

      writeStoredAccounts([...accounts, nextUser])
      setUser(nextUser)
      setView('chat')
      toast('Account created locally on this device.', 'success')
    },
    [toast],
  )

  const signOut = useCallback(() => {
    setUser(null)
    setView('auth')
  }, [])

  const toggleDark = useCallback(() => setDark((d) => !d), [])
  const setAccent = useCallback((id: string) => setAccentId(id), [])

  const setPersona = useCallback((id: PersonaId) => {
    setPersonaState(id)
  }, [])

  const newChat = useCallback(() => {
    setActiveId(null)
  }, [])

  const selectConversation = useCallback((id: string) => {
    setActiveId(id)
    setConversations((prev) => {
      const c = prev.find((x) => x.id === id)
      if (c) setPersonaState(c.persona)
      return prev
    })
  }, [])

  const openUpgrade = useCallback(() => setUpgradeOpen(true), [])
  const closeUpgrade = useCallback(() => setUpgradeOpen(false), [])

  const applyCoupon = useCallback(
    (code: string) => {
      if (code.trim().length >= 4) {
        setChatLimit((l) => l + 15)
        setChatsRemaining((r) => r + 15)
        toast('Coupon applied! +15 chats added.', 'success')
        setUpgradeOpen(false)
        return true
      }
      toast('Invalid coupon code. Try again.', 'default')
      return false
    },
    [toast],
  )

  const sendMessage = useCallback(
    async (text: string, attachment?: AttachmentPayload) => {
      const trimmed = text.trim()
      if (!trimmed && !attachment) return
      if (chatsRemaining <= 0) {
        setUpgradeOpen(true)
        return
      }

      const now = Date.now()
      const userMsg: ChatMessage = {
        id: uid(),
        role: 'user',
        content: trimmed,
        persona,
        attachment: attachment?.name,
        createdAt: now,
      }

      let convId = activeId

      // Keep routing consistent: use the active conversation persona if one exists.
      const activePersona: PersonaId | null = activeId
        ? conversations.find((c) => c.id === activeId)?.persona ?? null
        : null
      const effectivePersona: PersonaId = activePersona ?? persona
      const effectivePersonaForPayload = effectivePersona

      // Update the message persona to match the conversation persona.
      userMsg.persona = effectivePersonaForPayload

      setConversations((prev) => {
        let next = [...prev]
        if (!convId) {
          convId = uid()
          next = [
            {
              id: convId,
              title: titleFromInput(trimmed || 'Shared a file'),
              persona: effectivePersonaForPayload,
              messages: [userMsg],
              updatedAt: now,
            },
            ...next,
          ]
        } else {
          next = next.map((c) =>
            c.id === convId
              ? { ...c, messages: [...c.messages, userMsg], updatedAt: now }
              : c,
          )
        }
        return next
      })

      if (!activeId && convId) setActiveId(convId)

      setChatsRemaining((r) => Math.max(0, r - 1))
      setIsThinking(true)

      const targetId = convId
      const history = conversations.find((conversation) => conversation.id === targetId)?.messages ?? []
      const requestMessages = [
        ...history.map((message) => ({ role: message.role, content: message.content })),
        { role: 'user' as const, content: trimmed },
      ]

      try {
        const endpoint = effectivePersonaForPayload === 'image' ? '/api/image' : '/api/chat'
        const payload =
          effectivePersonaForPayload === 'image'
            ? { prompt: trimmed }
            : {
                persona: effectivePersonaForPayload,
                messages: requestMessages,
                attachment: attachment
                  ? {
                      name: attachment.name,
                      dataUrl: attachment.dataUrl,
                      mimeType: attachment.mimeType,
                    }
                  : undefined,
              }


        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Unable to generate a response right now.')

        const replyContent =
          effectivePersonaForPayload === 'image'
            ? data.image
              ? 'Image generated successfully.'
              : data.content || 'Image generation completed.'
            : data.content || 'No response generated.'

        const reply: ChatMessage = {
          id: uid(),
          role: 'assistant',
          content: replyContent,
          persona: effectivePersonaForPayload,
          image: data.image,
          createdAt: Date.now(),
        }

        setConversations((prev) =>
          prev.map((c) =>
            c.id === targetId
              ? { ...c, messages: [...c.messages, reply], updatedAt: Date.now() }
              : c,
          ),
        )
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unexpected error occurred.'
        const fallback: ChatMessage = {
          id: uid(),
          role: 'assistant',
          content: message,
          persona,
          error: true,
          createdAt: Date.now(),
        }
        setConversations((prev) =>
          prev.map((c) =>
            c.id === targetId
              ? { ...c, messages: [...c.messages, fallback], updatedAt: Date.now() }
              : c,
          ),
        )
        toast(message, 'info')
      } finally {
        setIsThinking(false)
      }
    },
    [activeId, chatsRemaining, persona, toast],
  )

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  )

  const value: AppState = {
    view,
    user,
    dark,
    accentId,
    persona,
    conversations,
    activeId,
    activeConversation,
    isThinking,
    chatLimit,
    chatsRemaining,
    upgradeOpen,
    toasts,
    signIn,
    signUp,
    signOut,
    toggleDark,
    setAccent,
    setPersona,
    newChat,
    selectConversation,
    sendMessage,
    setView,
    openUpgrade,
    closeUpgrade,
    applyCoupon,
    toast,
    dismissToast,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export { getPersona }
