import { createAdminClient } from '@/lib/supabase/server-admin'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { ClientsClient } from './ClientsClient'
import type { Client, District, Profile } from '@/types'

export default async function ClientsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const db = createAdminClient()

  const [clientsRes, sellersRes, districtsRes] = await Promise.all([
    db.from('clients')
      .select('*, assigned_profile:profiles!assigned_to(id, full_name, email)')
      .order('created_at', { ascending: false }),
    db.from('profiles').select('id, full_name, email, role').eq('status', 'active'),
    db.from('districts').select('id, name').order('name'),
  ])

  const clients = (clientsRes.data || []) as unknown as Client[]
  const sellers = (sellersRes.data || []) as Pick<Profile, 'id' | 'full_name' | 'email' | 'role'>[]
  const districts = (districtsRes.data || []) as District[]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Клиенты / Лиды</h1>
      </div>
      <ClientsClient
        clients={clients}
        sellers={sellers}
        districts={districts}
        currentUserId={session.id}
        isAdmin={session.role === 'admin'}
      />
    </div>
  )
}
