import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SellersClient } from './SellersClient'

export default async function SellersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id || '').single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: sellers } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Продавцы</h1>
      <SellersClient sellers={sellers || []} />
    </div>
  )
}
