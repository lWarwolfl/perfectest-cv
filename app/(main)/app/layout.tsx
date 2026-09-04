import { getCurrentUser } from '@/lib/auth/server'
import { SidebarPage } from '@/components/layout/sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  return (
    <SidebarPage email={user?.email}>{children}</SidebarPage>
  )
}
