import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DistrictsClient } from './DistrictsClient'

export default async function DistrictsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id || '').single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: districts } = await supabase.from('districts').select('*').order('name')

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Справочник районов</h1>
      <DistrictsClient districts={districts || []} />
    </div>
  )
}
