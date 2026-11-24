import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { Sidebar } from '@/components/layout/Sidebar'
import type { Profile } from '@/types'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession()

  if (!user || user.status === 'disabled') {
    redirect('/login')
  }

  const profile: Profile = {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    phone: null,
    role: user.role,
    status: user.status,
    created_at: new Date().toISOString(),
    created_by: null,
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar user={profile} />
      <main className="flex-1 overflow-y-auto md:pl-64">
        <div className="p-4 md:p-6 pt-16 md:pt-6">
          {children}
        </div>
      </main>
    </div>
  )
}
