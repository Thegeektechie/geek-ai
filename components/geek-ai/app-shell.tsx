'use client'

import { useApp } from './app-provider'
import { AuthView } from './auth-view'
import { ChatView } from './chat-view'
import { AdminDashboard } from './admin-dashboard'
import { UpgradeModal } from './upgrade-modal'
import { Toaster } from './toaster'

export function AppShell() {
  const { view } = useApp()

  return (
    <>
      {view === 'auth' && <AuthView />}
      {view === 'chat' && <ChatView />}
      {view === 'admin' && <AdminDashboard />}
      <UpgradeModal />
      <Toaster />
    </>
  )
}
