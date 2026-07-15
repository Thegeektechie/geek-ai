'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  generateMockReply,
  getAccent,
  getPersona,
  titleFromInput,
  type ChatMessage,
  type Conversation,
  type PersonaId,
} from '@/lib/geek-ai'

type View = 'auth' | 'chat' | 'admin'

interface User {
  name: string
  email: string
}

interface Toast {
  id: string
  message: string
  variant: 'default' | 'success' | 'info'
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
  signIn: (email: string) => void
  signOut: () => void
  toggleDark: () => void
  setAccent: (id: string) => void
  setPersona: (id: PersonaId) => void
  newChat: () => void
  selectConversation: (id: string) => void
  sendMessage: (text: string, attachment?: string) => void
  setView: (v: View) => void
  openUpgrade: () => void
  closeUpgrade: () => void
  applyCoupon: (code: string) => boolean
  toast: (message: string, variant?: Toast['variant']) => void
  dismissToast: (id: string) => void
}

const Ctx = createContext<AppState | null>(null)

const uid = () => Math.random().toString(36).slice(2, 10)

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

  /* apply dark mode */
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', dark)
    root.classList.toggle('light', !dark)
  }, [dark])

  /* apply accent as CSS variables */
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

  const signIn = useCallback((email: string) => {
    const name = email.split('@')[0] || 'Geek'
    setUser({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email,
    })
    setView('chat')
  }, [])

  const signOut = useCallback(() => {
    setUser(null)
    setView('auth')
    setConversations(seedConversations())
    setActiveId(null)
    setChatsRemaining(10)
    setChatLimit(10)
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
    (text: string, attachment?: string) => {
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
        attachment,
        createdAt: now,
      }

      let convId = activeId
      setConversations((prev) => {
        let next = [...prev]
        if (!convId) {
          convId = uid()
          next = [
            {
              id: convId,
              title: titleFromInput(trimmed || 'Shared a file'),
              persona,
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
      window.setTimeout(() => {
        const reply: ChatMessage = {
          id: uid(),
          role: 'assistant',
          content: generateMockReply(trimmed, persona, Boolean(attachment)),
          persona,
          createdAt: Date.now(),
        }
        setConversations((prev) =>
          prev.map((c) =>
            c.id === targetId
              ? { ...c, messages: [...c.messages, reply], updatedAt: Date.now() }
              : c,
          ),
        )
        setIsThinking(false)
        setChatsRemaining((r) => {
          if (r <= 0) setTimeout(() => setUpgradeOpen(true), 400)
          return r
        })
      }, 900)
    },
    [activeId, chatsRemaining, persona],
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
