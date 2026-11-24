import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { DistrictsClient } from './DistrictsClient'

export default async function DistrictsPage() {
  const session = await getSession()
  if (session?.role !== 'admin') redirect('/dashboard')

  const supabase = await createClient()
  const { data: districts } = await supabase.from('districts').select('*').order('name')

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Справочник районов</h1>
      <DistrictsClient districts={districts || []} />
    </div>
  )
}
