import { AppProvider } from '@/components/geek-ai/app-provider'
import { AppShell } from '@/components/geek-ai/app-shell'

export default function Page() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}
