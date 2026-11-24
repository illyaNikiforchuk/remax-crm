import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.status === 'disabled') {
    await supabase.auth.signOut()
    redirect('/login')
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
